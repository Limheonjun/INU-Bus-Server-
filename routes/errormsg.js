const express = require('express');
const router = express.Router();
const config = require('../config.js');


//문의 사항 라우터
router.post('/errormsg', function(req, res){
  var title = req.body.title;
  var msg = req.body.msg;
  var contact = req.body.contact;
  var device = req.body.device;
  if(!title){
    title = " ";
  }
  if(!msg){
    msg = " ";
  }
  if(!contact){
    contact = " ";
  }
  if(!device){
    device = " ";
  }
  var pool = mysql.createPool(config.MYSQL_CONFIG);
  pool.getConnection(function(err, connection){
    if(err){
      console.log(err);
      res.status(404).send("DB_ERROR");
    }
    else {
      connection.query("insert into question set?", {title:title, msg:msg, contact:contact, device:device}, function(err, results){
          if(!err){
            res.status(200).send("SUCCESS");
          }
          else {
            console.log(err);
            res.status(404).send("DB_QUERY_ERROR");
          }
      });
    }
  });
});

module.exports = router;
