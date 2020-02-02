'use strict'
const express = require('express');
const config = require('../config');
const mysql = require('mysql');
const pool = mysql.createPool(config.MYSQL_CONFIG);
const router = express.Router();

//문의 사항 라우터
router.post('/', (req, res)=>{
  const title = req.body.title || "";
  const message = req.body.message || "";
  const contact = req.body.contact || "";
  const device = req.body.device || "";
  console.log("data : "+JSON.stringify(req.body));


  pool.getConnection((err, connection)=>{
    if(err){
      console.log(err);
      res.status(404).send("DB_ERROR");
    }
    else {
      connection.query("insert into questions(title, message, contact, device) values(?, ?, ?, ?)", [title, message, contact, device], (err, results)=>{
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
