'use strict'
const express = require('express');
const config = require('../config');
const data = require('../functions/Data.js');
const HashMap = require('hashmap');
const router = express.Router();

// functions
const util = require('../functions/util.js');


let arrivalInfo = [];
let start=true;

//  goHome();
if(!process.env.NODE_ENV || process.env.NODE_ENV.trimRight() !== 'test'){
  setInterval(()=>{goHome()},30000);
} else {
  goHome();
}



// 도착정보
function goHome(){
  Promise.all([data.getSeoulNbus(), data.getIncheonNbus(), data.getIncheonPbus()])
  .then(()=>{
    console.log('Processing is Done!\n');
    if(start){
      arrivalInfo = data.returnNodes();
      data.resetNodes();
      start=!start;
    } else {
      console.log(`\n-----------Updatde Bus List At ${util.getDateTime()}-----------`);
      let temp = data.returnNodes();
      data.resetNodes();
      let insert = [];

      arrivalInfo.forEach((bus,busIdx)=>{
        let datas = [];
        if(bus.data.length == 0 && !temp[busIdx].data.length) {
          bus.data = temp[busIdx].data;
          return true;
        }
        if(temp[busIdx].data.length == 0) return true;
        
        let map = new HashMap();
        bus.data.forEach(val=>{
          map.set(val.no, val);
        });
        
        temp[busIdx].data.forEach((val)=>{
          if(map.get(val.no)){
            if(map.get(val.no).arrival < val.arrival){
              map.set(val.no, val);
              console.log(bus.name+' : No.'+val.no+' Bus Data Updated');
            }
          } else{
            map.set(val.no, val);
            console.log(bus.name+' : No.'+val.no+' Bus Data Added');
          }
        });

        map.forEach((val, idx)=>{
          datas.push({
            no : map.get(idx).no,
            arrival : map.get(idx).arrival,
            start : map.get(idx).start,
            end : map.get(idx).end,
            interval : map.get(idx).interval,
            type : map.get(idx).type
          });
        });

        insert.push({name : bus.name, data : datas});
      });

      if(insert.length < 3)  return;
      arrivalInfo = insert;
      console.log(`-------------------------------------------------------------\n`);
    }
  })
  .catch((e)=>console.log(e));
}

// 노선 정보 출력 라우터
router.get('/', (req, res)=>{
    res.status(200).send(arrivalInfo);
});

module.exports = router;
