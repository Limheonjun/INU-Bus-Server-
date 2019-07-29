module.exports = {
  getIncheonPbus : getIncheonPbus,
  getIncheonNbus : getIncheonNbus,
  getSeoulNbus : getSeoulNbus,
  getbusNodes : getbusNodes,
  getIncheonBusData : getIncheonBusData,
  getSeoulBusData : getSeoulBusData,
  getBusInformation : getBusInformation,
  returnNodes : returnNodes,
  resetNodes : resetNodes
};


const convert = require('xml-js');
const request = require('sync-request');
const config = require('../config.js');

// functions
const url = require('./url.js');
const util = require('./util.js');
const process = require('./process.js');

// 참조할 버스들 기본 정보 (회차지 추가)
const buses = config.BUS_TIME_TABLE;
// 각 정류장에 대한 데이터
var schoolnodes = [config.BUS_STOP_FRONTGATE, config.BUS_STOP_SCIENCE, config.BUS_STOP_ENGINEER];
// 서울버스(6405,1301,3002) routeId
var seoulBus = [buses[9].routeid, buses[10].routeid, buses[11].routeid];
// 해경방향쪽 인천대 정문 정류장 nodeId
var incheonEntrance = 'ICB164000396';
// 인천대 정류장 도착정보가 담길 데이터 구조
var nodes = [
  {name : 'frontgate', data : []},
  {name : 'science', data : []},
  {name : 'engineer', data : []}
];


// 인천대입구역까지 남은 시간을 역으로 계산하는 인천버스
// 30초에 쿼리 1
function getIncheonPbus(){
  var url_new = url.makeIncheonBusUrl(incheonEntrance);
  var data = getIncheonBusData(url_new);
  if(util.checkEmpty(data)) return;
  for(var i=0; i<data.length; i++){
    // 버스 번호 처리
    data[i].routeno = process.processBusNo(data[i].routeno);
    // 처리한 버스번호로 버스 정보 불러오기
    var busInfo = getBusInformation(data[i].routeno);
    // 중복되는 버스가 존재하면 다음버스로 넘어감
    if(process.checkIncheonPbusOverlap(data[i].routeno)) continue;
    // 해당 버스가 각 정류장에 정차하는지 확인 후 정차하면 추가
    for(var j=0; j<schoolnodes.length; j++){
      for(var k=0; k<schoolnodes[j].pbus.length; k++){
        if(data[i].routeno == schoolnodes[j].pbus[k].no){
          nodes[j].data.push({
            no : data[i].routeno,
            arrival : Date.now() + (data[i].arrtime - (j+1)*60)*1000,
            start : busInfo.data.start,
            end : busInfo.data.end,
            interval : busInfo.data.interval,
            type : busInfo.data.type
          });
        }
      }
    }
  }
  process.clearIncheonPbusverlap();
}

// 학교 정류장별로 조회되는 인천버스
// 30초에 쿼리 3
function getIncheonNbus(){
  for(var i=0; i<schoolnodes.length; i++){
    var url_new = url.makeIncheonBusUrl(schoolnodes[i].id);
    var data = getIncheonBusData(url_new);
    if(util.checkEmpty(data)) continue;
    for(var j=0; j<data.length; j++){
      // 버스 번호 처리
      data[j].routeno = process.processBusNo(data[j].routeno);
      // 처리한 버스번호로 버스 정보 불러오기
      var busInfo = getBusInformation(data[j].routeno);
      // 중복되는 버스가 존재하면 다음버스로 넘어감
      if(process.checkIncheonNbusOverlap(data[j].routeno)) continue;
      // 해당 버스가 각 정류장에 정차하는지 확인 후 정차하면 추가
      for(var k=0; k<schoolnodes[i].nbus.length; k++){
        if(data[j].routeno == schoolnodes[i].nbus[k]){
          nodes[i].data.push({
            no : data[j].routeno,
            arrival : Date.now() + data[j].arrtime*1000,
            start : busInfo.data.start,
            end : busInfo.data.end,
            interval : busInfo.data.interval,
            type : busInfo.data.type
          });
        }
      }
    }
    process.clearIncheonNbusverlap();
  }
}

// 버스 노선정보 검색
async function getbusNodes(){
  var busNodes = [];
  for(var i=0; i<buses.length; i++){
    try {
      if(buses[i].api == '국토교통부'){
        var url_new = url.makeBusNodesUrl(buses[i].routeid);
      } else {
        var url_new = url.makeBusNodesUrl('ICB'+buses[i].routeid);
      }
      //console.log('http://' + url_new.host + url_new.path);
      var res = await request('GET', 'http://' + url_new.host + url_new.path);
      var json = JSON.parse(res.getBody('utf8'));
      if(util.checkEmpty(json)) continue;
      var temp = [];
      for(var j=0; j<json.response.body.totalCount; j++){
        var item = json.response.body.items.item;
        temp.push(item[j].nodenm);
      }
      var data = {
        no:process.processBusNo(util.fn(buses[i].no)),
        routeid:buses[i].routeid,
        nodelist:temp,
        turnnode:buses[i].data.turnnode,
        start: buses[i].data.start,
    		end: buses[i].data.end,
        type: buses[i].data.type
      };
      busNodes.push(data);
    } catch (e) {
      console.log('getbusNodes() request error : ' + e);
      return;
    }
  }
  console.log('BusNodes Updated!');
  return busNodes;
}

// 인천버스 url 요청 및 데이터 반환
function getIncheonBusData(url_new){
  var item = [];
  try {
    var res = request('GET', 'http://' + url_new.host + url_new.path);
    var json = JSON.parse(res.getBody('utf8'));
    // 일일 트래픽 초과 예외처리
    //if(json.response.header.resultMsg != 'NORMAL SERVICE.') return;
    // 일일 트래픽 초과 예외처리
    if (json.response.header.resultMsg == 'LIMITED NUMBER OF SERVICE REQUESTS EXCEEDS ERROR.'){
      // TODO: 서비스키 변경
      console.log('Daily traffic exceeded. Please change the servicekey.');
      url.changeIncheonServiceKey();
      return;
    }
    if(json.response.body.totalCount != 0)
    {
      if(json.response.body == undefined)
      {
        console.log(json);
      }
      else
      {
        item = json.response.body.items.item;
      }
    } else {
      return;
    }
  } catch (e) {
    console.log('getIncheonbusData(url) request error : ' + e);
  }
  return item;
}

// 학교 정류장별로 조회되는 서울버스(3002, 1301)
// 30초에 쿼리 2
function getSeoulNbus(){
  for(var k=1; k<seoulBus.length; k++){
    var url_new = url.makeSeoulBusUrl(seoulBus[k]);
    var data = getSeoulBusData(url_new);
    if(util.checkEmpty(data)) return;
    for(var i=0; i<schoolnodes.length; i++){
      for(var j=0; j<data.length; j++){
        if(util.fn(schoolnodes[i].id) == data[j].stId._text){

          // 출발대기인 경우 넘어가기
          if(util.checkWait(data[j].arrmsg1._text) || !util.separateTime(data[j].arrmsg1._text)) continue;
          data[j].rtNm._text = util.fn(data[j].rtNm._text)
          // 처리한 버스번호로 버스 정보 불러오기

          var busInfo = getBusInformation(data[j].rtNm._text);
          nodes[i].data.push({
            no : data[j].rtNm._text,
            arrival : Date.now() + util.separateTime(data[j].arrmsg1._text)*1000,
            start : busInfo.data.start,
            end : busInfo.data.end,
            interval : busInfo.data.interval,
            type : busInfo.data.type
          });
        }
      }
    }
  }
}

// 서울버스 url 요청 및 데이터 반환
function getSeoulBusData(url_new){
  var itemList = [];
  try{
    var res = request('GET', 'http://' +url_new.host + url_new.path);
    var xmlToJson = convert.xml2json(res.getBody().toString(), {compact: true, spaces: 2}); // space는 하위 태그당 들여쓰기 수
    var json = JSON.parse(xmlToJson);
    itemList = json.ServiceResult.msgBody.itemList;
  } catch (e) {
    console.log('seoulbus(url) request error : ' + e);
    return;
  }
  return itemList;
}


// nodes에 들어있는 정보 반환
function returnNodes(){
  return nodes;
}

// nodes 초기화
function resetNodes(){
  nodes = [
    {name : 'frontgate', data : []},
    {name : 'science', data : []},
    {name : 'engineer', data : []}
  ];
}

// 버스 번호에 맞는 데이터 불러오기
function getBusInformation(routeno){
  for(var i = 0 ; i < buses.length; i++)
  {
    if(buses[i].no == routeno)
    {
      return buses[i];
    }
  }
  return -1;
}
