'use strict'
module.exports = {
  getIncheonPbus : getIncheonPbus,
  getIncheonNbus : getIncheonNbus,
  getSeoulNbus : getSeoulNbus,
  getbusNodes : getbusNodes,
  getIncheonBusData : getIncheonBusData,
  getSeoulBusData : getSeoulBusData,
  getBusInformation : getBusInformation,
  returnNodes : returnNodes,
  resetNodes : resetNodes,
  getBusLocation : getBusLocation
};


const convert = require('xml-js');
const request = require('sync-request');
const config = require('../config');

// functions
const url = require('./url.js');
const util = require('./util.js');
const process = require('./process.js');

// 참조할 버스들 기본 정보 (회차지 추가)
const buses = config.BUS_TIME_TABLE;
// 각 정류장에 대한 데이터
const schoolnodes = [config.BUS_STOP_FRONTGATE, config.BUS_STOP_SCIENCE, config.BUS_STOP_ENGINEER];
// 해경방향쪽 인천대 정문 정류장 nodeId
const incheonEntrance = 'ICB164000396';
// 인천대 정류장 도착정보가 담길 데이터 구조
let nodes = [
  {name : 'frontgate', data : []},
  {name : 'science', data : []},
  {name : 'engineer', data : []}
];


// 인천대입구역까지 남은 시간을 역으로 계산하는 인천버스
// 30초에 쿼리 1
function getIncheonPbus(){
  return new Promise((resolve, reject)=>{
  console.log(`IncheonPbus is being Processed . . .`);  
  let url_new = url.makeIncheonBusUrl(incheonEntrance);
  let data = getIncheonBusData(url_new);
  if(!util.checkEmpty(data)) {
    Array.from(data).forEach((val,idx)=>{
      // 처리한 버스번호로 버스 정보 불러오기
      let busInfo = getBusInformation(process.processBusNo(val.routeno));
      // 중복되는 버스가 존재하면 다음버스로 넘어감
      if(process.checkIncheonPbusOverlap(val.routeno)) return true;
      // 해당 버스가 각 정류장에 정차하는지 확인 후 정차하면 추가
      schoolnodes.forEach((node,nodeIdx)=>{
        node.pbus.forEach((pbus,pbusIdx)=>{
          if(val.routeno == pbus.no){
            nodes[nodeIdx].data.push({
              no : val.routeno,
              arrival : Date.now() + (val.arrtime - (nodeIdx+1)*60)*1000,
              start : busInfo.data.start,
              end : busInfo.data.end,
              interval : busInfo.data.interval,
              type : busInfo.data.type
            });
          }
        });
      });
    });
    process.clearIncheonPbusverlap();
  }
  resolve();
  });
  
}

// 학교 정류장별로 조회되는 인천버스
// 30초에 쿼리 3
function getIncheonNbus(){
  return new Promise((resolve)=>{
    console.log(`IncheonNbus is being Processed . . .`);
    schoolnodes.forEach((node,nodeIdx)=>{
      let url_new = url.makeIncheonBusUrl(node.id);
      let data = getIncheonBusData(url_new);
      //console.log(JSON.stringify(data));
      if(util.checkEmpty(data) || data.length<1) return true;
      Array.from(data).forEach((val1,idx)=>{
        let busInfo = getBusInformation(process.processBusNo(val1.routeno));
        // 중복되는 버스가 존재하면 다음버스로 넘어감
        if(process.checkIncheonNbusOverlap(val1.routeno)) return true;;
        node.nbus.forEach((val2,nbusIdx)=>{
          if(val1.routeno == val2){
            nodes[nodeIdx].data.push({
              no : val1.routeno,
              arrival : Date.now() + val1.arrtime*1000,
              start : busInfo.data.start,
              end : busInfo.data.end,
              interval : busInfo.data.interval,
              type : busInfo.data.type
            });
          }
        });
      });
      process.clearIncheonNbusverlap();
    });
    resolve();
  });

}

// 버스 노선정보 검색
function getbusNodes(){
  let busNodes = [];
  buses.forEach((bus,busIdx)=>{
    try{
      if(bus.api == '국토교통부'){
        let url_new = url.makeBusNodesUrl(bus.routeid);
      } else {
        let url_new = url.makeBusNodesUrl('ICB'+ bus.routeid);
      }
      let res = request('GET', 'http://' + url_new.host + url_new.path);
      let json = JSON.parse(res.getBody('utf8'));
      if(util.checkEmpty(json)) return true;
      if(json.response.body.totalCount<1) return true;
      let temp = [];
      let items = json.response.body.items.item;
      items.forEach(item=>{temp.push(item.nodenm);});
      let data = {
        no:process.processBusNo(util.fn(bus.no)),
        routeid:bus.routeid,
        nodelist:temp,
        turnnode:bus.data.turnnode,
        start: bus.data.start,
    		end: bus.data.end,
        type: bus.data.type
      };
      busNodes.push(data);
    } catch (e) {
      console.log('getbusNodes() request error : ' + e);
      return;
    }
  });
  console.log('BusNodes Updated!');
  return busNodes;
}

// 인천버스 url 요청 및 데이터 반환
function getIncheonBusData(url_new){
  let item = [];
  try {
    let res = request('GET', 'http://' + url_new.host + url_new.path);
    let json = JSON.parse(res.getBody('utf8'));
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
    url.changeIncheonServiceKey();
  }
  return item;
}

// 학교 정류장별로 조회되는 서울버스(3002, 1301)
// 30초에 쿼리 2
function getSeoulNbus(){
  return new Promise((resolve, reject)=>{
    console.log(`SeoulNbus is being Processed . . .`);
    const seoulBus = buses.filter(val=>{return val.api=='서울특별시';});
    seoulBus.forEach((val,idx)=>{
      let url_new = url.makeSeoulBusUrl(val.routeid);
      let data = getSeoulBusData(url_new);
      schoolnodes.forEach(bustop=>{
        let obj = data.find(val2=>val2.stId_test==util.fn(bustop.id)) || -1;
        if(obj!=-1 && !(util.checkWait(val2.arrmsg1._text) || !util.separateTime(val2.arrmsg1._text))){
          //if(util.checkWait(val2.arrmsg1._text) || !util.separateTime(val2.arrmsg1._text)) continue;
            val2.rtNm._text = util.fn(val2.rtNm._text)
            // 처리한 버스번호로 버스 정보 불러오기
            let busInfo = getBusInformation(val2.rtNm._text);
            nodes[i].data.push({
              no : val2.rtNm._text,
              arrival : Date.now() + util.separateTime(val2.arrmsg1._text)*1000,
              start : busInfo.data.start,
              end : busInfo.data.end,
              interval : busInfo.data.interval,
              type : busInfo.data.type
            });
        }
      });
    });
    resolve();
  });
}

// 서울버스 url 요청 및 데이터 반환
function getSeoulBusData(url_new){
  let itemList = [];
  try{
    let res = request('GET', 'http://' +url_new.host + url_new.path);
    let xmlToJson = convert.xml2json(res.getBody().toString(), {compact: true, spaces: 2}); // space는 하위 태그당 들여쓰기 수
    let json = JSON.parse(xmlToJson);
    itemList = json.ServiceResult.msgBody.itemList;
  } catch (e) {
    console.log('seoulbus(url) request error : ' + e);
    url.changeSeoulServiceKey();
    return;
  }
  return itemList;
}

// 버스 실시간 위치
function getBusLocation(){
  return new Promise(resolve=>{
    let datas = [];
    try{
      buses.forEach((bus, busIdx)=>{
        if(bus.api == '서울특별시') return true;
        let url_new = url.makeBusLocationUrl(bus.routeid);
        let res = request('GET', 'http://' + url_new.host + url_new.path);
        let json = JSON.parse(res.getBody('utf8'));
        let temp = [];
        if(json.response.body.totalCount == 0) return true;
        let items = json.response.body.items.item;
        items.forEach(item=>{
          let {nodeid, nodenm, nodeord, vehicleno} = item;
          temp.push({nodeid, nodenm, nodeord, vehicleno});
        });
        let data = {
          no:process.processBusNo(util.fn(bus.no)),
          routeid:bus.routeid,
          nodelist:temp,
        };
        datas.push(data);
      });
    } catch (e) {
      console.log('getBusLocation() request error : ' + e);
      return;
    } finally {
      resolve(datas);
    }
  });
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
  return buses.find(val=>val.no.toString()==routeno) || -1;
}
