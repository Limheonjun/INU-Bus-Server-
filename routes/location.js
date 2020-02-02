'use strict'
const express = require('express');
const config = require('../config');
const data = require('../functions/data.js');
const util = require('../functions/util.js');
const router = express.Router();

let locations;

async function getLocation(){
  locations = await data.getBusLocation();
}

if(!process.env.NODE_ENV || process.env.NODE_ENV.trimRight() !== 'test'){
  setInterval(()=>{
    getLocation();
    console.log(`Location Updated At ${util.getDateTime()}\n`);
  }, 30000);
} else {
  getLocation();
}



// 노선 정보 출력 라우터
router.get('/', (req, res)=>{
  res.status(200).send(locations);
});

module.exports = router;
