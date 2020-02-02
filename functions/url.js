'use strict'
module.exports = {
  makeBusNodesUrl : makeBusNodesUrl,
  makeIncheonBusUrl : makeIncheonBusUrl,
  makeSeoulBusUrl : makeSeoulBusUrl,
  changeIncheonServiceKey : changeIncheonServiceKey,
  changeSeoulServiceKey : changeSeoulServiceKey,
  getCurrentIncheonServiceKey : getCurrentIncheonServiceKey,
  getCurrentSeoulServiceKey : getCurrentSeoulServiceKey,
  makeBusLocationUrl : makeBusLocationUrl
};


const config = require('../config');
const serviceKey = [config.SERVICE_KEY1, config.SERVICE_KEY2, config.SERVICE_KEY3];
const cityCode = '23';  // 인천
const arrivalinfoPath = '/openapi/service/ArvlInfoInqireService/getSttnAcctoArvlPrearngeInfoList';    // 버스 도착정보 path
const seoulbusPath = '/api/rest/arrive/getArrInfoByRouteAll'; // 서울버스 경유노선 전체 정류소 도착예정정보를 조회 path
const busnodePath = '/openapi/service/BusRouteInfoInqireService/getRouteAcctoThrghSttnList'; // 버스 정류장 path
const leftnodePath = '/openapi/service/BusLcInfoInqireService/getRouteAcctoBusLcList'; // 남은정류장계산
const buslocationPath = '/openapi/service/BusLcInfoInqireService/getRouteAcctoBusLcList'; // 버스 실시간 위치 path
let incheonServiceKey = serviceKey[1];
let seoulServiceKey = serviceKey[1];

// 인천 서비스키 변경
function changeIncheonServiceKey(){
  incheonServiceKey = serviceKey[(getCurrentIncheonServiceKey(incheonServiceKey)+1)%3];
  console.log('IncheonServiceKey Changed');
}

// 서울 서비스키 변경
function changeSeoulServiceKey(){
  seoulServiceKey = serviceKey[(getCurrentIncheonServiceKey(seoulServiceKey)+1)%3];
  console.log('SeoulServiceKey Changed');
}

// 현재 사용중인 인천 서비스키 확인
function getCurrentIncheonServiceKey(currentServiceKey){
  return serviceKey.indexOf(currentServiceKey);
}

// 현재 사용중인 서울 서비스키 확인
function getCurrentSeoulServiceKey(currentServiceKey){
  return serviceKey.indexOf(currentServiceKey);
}

// 버스 정류장정보 url 생성 후 반환
function makeBusNodesUrl(routeId){
  let options = {
    host: 'openapi.tago.go.kr',
    port: 80,
    path: `${busnodePath}?serviceKey=${incheonServiceKey}&numOfRows=300&pageNo=1&cityCode=${cityCode}&routeId=${routeId}&_type=json`,
    method: 'GET'
  }
  return options;
}

// 정류장 인천버스 조회 url 생성 후 반환
function makeIncheonBusUrl(nodeId){
  let options = {
    host: 'openapi.tago.go.kr',
    port: 80,
    path: `${arrivalinfoPath}?serviceKey=${incheonServiceKey}&cityCode=${cityCode}&nodeId=${nodeId}&numOfRows=200&_type=json`,
    method: 'GET'
  };
  return options;
}

// 서울버스 도착정보 url 생성 후 반환
function makeSeoulBusUrl(routeId){
  let options = {
    host: 'ws.bus.go.kr',
    port: 80,
    path: `${seoulbusPath}?serviceKey=${seoulServiceKey}&busRouteId=${routeId}`,
    method: 'GET'
  };
  return options;
}

// 인천버스 실시간 위치 url 생성 후 반환
// 다른 서비스키는 등록이 안되어있음
function makeBusLocationUrl(routeId){
  let options = {
    host: 'openapi.tago.go.kr',
    port: 80,
    path: `${buslocationPath}?ServiceKey=${serviceKey[1]}&cityCode=${cityCode}&routeId=${routeId}&numOfRows=300&_type=json`,
    method: 'GET'
  }
  return options;
}
