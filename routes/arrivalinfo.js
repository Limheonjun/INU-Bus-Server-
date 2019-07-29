const express = require('express');
const router = express.Router();
const config = require('../config.js');
const data = require('../functions/Data.js');
const HashMap = require('hashmap');

// functions
const util = require('../functions/util.js');


var arrivalInfo = [];


goHome(function(){
  arrivalInfo = data.returnNodes();
  data.resetNodes();
});

setInterval(function(){
  goHome(function(){
    console.log('ArrivalData Updated! '+util.getDateTime());
    var temp = data.returnNodes();
    data.resetNodes();
    var insert = [];
    try{
      for(var i=0; i<arrivalInfo.length; i++){
        var datas = [];
        if(arrivalInfo[i].data.length == 0 && !temp[i].data.length) {
          arrivalInfo[i].data = temp[i].data;
          continue;
        }
        if(temp[i].data.length == 0) continue;
        var map = new HashMap();
        for(var j=0; j<arrivalInfo[i].data.length; j++){
          map.set(arrivalInfo[i].data[j].no, arrivalInfo[i].data[j]);
        }

        for(var j=0; j<temp[i].data.length; j++){
          if(map.get(temp[i].data[j].no)){
            if(map.get(temp[i].data[j].no).arrival < temp[i].data[j].arrival){
              map.set(temp[i].data[j].no, temp[i].data[j]);
              console.log(temp[i].name+' : No.'+temp[i].data[j].no+' Bus Data Updated');
            }
          } else{
            map.set(temp[i].data[j].no, temp[i].data[j]);
            console.log(temp[i].name+' : No.'+temp[i].data[j].no+' Bus Data Added');
          }
        }
        map.forEach(function(value, key){
          datas.push({
            no : map.get(key).no,
            arrival : map.get(key).arrival,
            start : map.get(key).start,
            end : map.get(key).end,
            interval : map.get(key).interval,
            type : map.get(key).type
          });
        });
        insert.push({name : arrivalInfo[i].name, data : datas});
      }
      arrivalInfo = insert;
      temp = [];
      console.log();
    } catch(e){
      console.log(e);
      temp = [];
      console.log();
    }
  })},
30000);

// 도착정보
function goHome(callback){
  data.getSeoulNbus();
  data.getIncheonNbus();
  data.getIncheonPbus();
  callback();
}

// 노선 정보 출력 라우터
router.get('/', function(req, res){
    res.send(arrivalInfo);
  console.log(req.ip + ' '+ req.url + ' connected' );
});

module.exports = router;
