
'use strict'
module.exports = {
  checkIncheonNbusOverlap : checkIncheonNbusOverlap,
  checkIncheonPbusOverlap : checkIncheonPbusOverlap,
  processBusNo : processBusNo,
  clearIncheonPbusverlap : clearIncheonPbusverlap,
  clearIncheonNbusverlap : clearIncheonNbusverlap
};


// functions
const util = require('./util.js');

// 버스 중복 체크
let incheonPbusOverlap = [];
let incheonNbusOverlap = [];


// 중복되는 N버스 처리
function checkIncheonNbusOverlap(routeno){
  incheonNbusOverlap.forEach(val=>{
    if(val==routeno) return 1;
  });
  incheonNbusOverlap.push(routeno);
  // 중복되는 번호가 없으면 0반환
  return 0;
}

// 중복되는 P버스 저장 배열 초기화
function clearIncheonPbusverlap(){
  incheonPbusOverlap = [];
}

// 중복되는 P버스 저장 배열 초기화
function clearIncheonNbusverlap(){
  incheonNbusOverlap = [];
}

// 중복되는 P버스 처리
function checkIncheonPbusOverlap(routeno){
  incheonPbusOverlap.forEach(val=>{
    if(val==routeno) return 1;
  });
  incheonPbusOverlap.push(routeno);
  // 중복되는 번호가 없으면 0반환
  return 0;
}

// 버스 번호 780-1, 780-2, 6-1, 6-2 처리
function processBusNo(routeno){
  routeno = util.fn(routeno);
  switch(routeno){
    case '7801':
      routeno = '780-1';
      break;
    case '7802':
      routeno = '780-2';
      break;
    case '61':
      routeno = '6-1';
      break;
    case '62':
      routeno = '6-2';
      break;
    default:
      break;
  }
  return routeno;
}
