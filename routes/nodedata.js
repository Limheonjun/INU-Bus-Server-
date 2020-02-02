'use strict'
const express = require('express');
const config = require('../config');
const data = require('../functions/Data.js');
const fs = require('fs');
const router = express.Router();


// 상황에 따라 substring 함수를 제거하고 실행해야함
const datas = fs.readFileSync('busNodes.txt', 'utf8').substring(1);
const busNodes = JSON.parse(datas);

// 노선 정보 출력 라우터
router.get(['/', '/:no'], (req, res)=>{
  const no = req.params.no;
  if(no){
    busNodes.forEach(element => {
      if(element.no == no) res.status(200).send(element);
    });
  } else res.status(200).send(busNodes);
});

module.exports = router;
