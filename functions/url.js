module.exports = {
  makeBusNodesUrl : makeBusNodesUrl,
  makeIncheonBusUrl : makeIncheonBusUrl,
  makeSeoulBusUrl : makeSeoulBusUrl,
  changeIncheonServiceKey : changeIncheonServiceKey,
  changeSeoulServiceKey : changeSeoulServiceKey,
  getCurrentIncheonServiceKey : getCurrentIncheonServiceKey,
  getCurrentSeoulServiceKey : getCurrentSeoulServiceKey
};


const config = require('../config.js');
const serviceKey = [config.SERVICE_KEY1, config.SERVICE_KEY2, config.SERVICE_KEY3];
const cityCode = '23';  // 인천
const arrivalinfoPath = '/openapi/service/ArvlInfoInqireService/getSttnAcctoArvlPrearngeInfoList';    // 버스 도착정보 path
const seoulbusPath = '/api/rest/arrive/getArrInfoByRouteAll'; // 서울버스 경유노선 전체 정류소 도착예정정보를 조회 path
const busnodePath = '/openapi/service/BusRouteInfoInqireService/getRouteAcctoThrghSttnList'; // 버스 정류장 path
const leftnodePath = '/openapi/service/BusLcInfoInqireService/getRouteAcctoBusLcList'; // 남은정류장계산
var incheonServiceKey = serviceKey[1];
var seoulServiceKey = serviceKey[1];

// 인천 서비스키 변경
function changeIncheonServiceKey(){
  incheonServiceKey = serviceKey[(getCurrentIncheonServiceKey(incheonServiceKey)+1)%3];
  console.log('IncheonServiceKey Changed');
}

// 서울 서비스키 변경
function changeSeoulServiceKey(){
  seoulServiceKey = serviceKey[(getCurrentIncheonServiceKey(incheonServiceKey)+1)%3];
  console.log('SeoulServiceKey Changed');
}

// 현재 사용중인 인천 서비스키 확인
function getCurrentIncheonServiceKey(serviceKey){
  for(var i=0; i<serviceKey.length; i++){
    if(serviceKey[i] == incheonServiceKey) return i;
  }
}

// 현재 사용중인 서울 서비스키 확인
function getCurrentSeoulServiceKey(serviceKey){
  for(var i=0; i<serviceKey.length; i++){
    if(serviceKey[i] == seoulServiceKey) return i;
  }
}

// 버스 정류장정보 url 생성 후 반환
function makeBusNodesUrl(routeId){
  var options = {
    host: 'openapi.tago.go.kr',
    port: 80,
    path: busnodePath +
    '?serviceKey=' + incheonServiceKey +
    '&numOfRows=300' +
    '&pageNo=1' +
    '&cityCode=' + cityCode +
    '&routeId=' + routeId +
    '&_type=json',
    method: 'GET'
  }
  return options;
}

// 정류장 인천버스 조회 url 생성 후 반환
function makeIncheonBusUrl(nodeId){
  var options = {
    host: 'openapi.tago.go.kr',
    port: 80,
    path: arrivalinfoPath +
    '?serviceKey=' + incheonServiceKey +
    '&cityCode=' + cityCode +
    '&nodeId=' + nodeId +
    '&numOfRows=200&_type=json',
    method: 'GET'
  };
  return options;
}

// 서울버스 도착정보 url 생성 후 반환
function makeSeoulBusUrl(routeId){
  var options = {
    host: 'ws.bus.go.kr',
    port: 80,
    path: seoulbusPath +
    '?serviceKey=' + seoulServiceKey +
    '&busRouteId=' + routeId,
    method: 'GET'
  };
  return options;
}
