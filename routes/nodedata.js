const express = require('express');
const router = express.Router();
const config = require('../config.js');
const data = require('../functions/Data.js');
const fs = require('fs');


//var busNodes = data.getbusNodes();
var datas = fs.readFileSync('busNodes.txt', 'utf8').substring(1);
var busNodes = JSON.parse(datas);

// 노선 정보 출력 라우터
router.get(['/', '/:no'], function(req, res){
  var no = req.params.no;
  if(no){
    for(var i=0; i<busNodes.length ;i++){
      if(no == busNodes[i].no){
        res.send(busNodes[i]);
      }
    }
  } else {
    res.send(busNodes);
  }
  console.log(req.ip + ' '+ req.url + ' connected' );
});

module.exports = router;
