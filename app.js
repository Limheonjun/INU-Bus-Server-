"use strict"
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const config = require('./config');

// functions
const url = require('./functions/url.js');
const util = require('./functions/util.js');
const data = require('./functions/data.js');

// routes
const arrivalInfo = require('./routes/arrivalinfo.js');
const nodeData = require('./routes/nodedata.js');
const errormsg = require('./routes/errormsg.js');
const gps = require('./routes/gps.js');
const location = require('./routes/location.js');

// middleware
// if(!process.env.NODE_ENV || process.env.NODE_ENV.trimRight() !== 'test'){
//   app.use(morgan('dev'));
// }
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use('/nodeData', nodeData);
app.use('/arrivalInfo', arrivalInfo);
app.use('/errormsg', errormsg);
app.use('/gps', gps);
app.use('/location', location);

/*

버스 id는 routeId로 통일
노선 id는 nodeId로 통일

Initial Commit
- 인천 nbus
- 인천 pbus
- 버스 정류장 조회

*/

module.exports = app;
