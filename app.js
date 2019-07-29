const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const config = require('./config.js');

// functions
const url = require('./functions/url.js');
const util = require('./functions/util.js');
const data = require('./functions/data.js');

// routes
const arrivalInfo = require('./routes/arrivalinfo.js');
const nodeData = require('./routes/nodedata.js');
const errormsg = require('./routes/errormsg.js');
const gps = require('./routes/gps.js');

// middleware
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use('/nodeData', nodeData);
app.use('/arrivalInfo', arrivalInfo);
app.use('/errormsg', errormsg);
app.use('/gps', gps);

/*

버스 id는 routeId로 통일
노선 id는 nodeId로 통일

Initial Commit
- 인천 nbus
- 인천 pbus
- 버스 정류장 조회

*/

const server = app.listen(config.PORT, function(){
  console.log(`Server running at ${config.PORT}`);
});
