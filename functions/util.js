module.exports = {
  getDateTime : getDateTime,
  checkEmpty : checkEmpty,
  fn : fn,
  separateTime : separateTime,
  checkWait : checkWait
};


// 현재 날짜(년, 달, 일, 시간, 분, 초) 반환
function getDateTime(){
  var date = new Date();
  var hour = date.getHours();
  var min  = date.getMinutes();
  var sec  = date.getSeconds();
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var day  = date.getDate();
  hour = (hour < 10 ? "0" : "") + hour;
  min = (min < 10 ? "0" : "") + min;
  sec = (sec < 10 ? "0" : "") + sec;
  month = (month < 10 ? "0" : "") + month;
  day = (day < 10 ? "0" : "") + day;
  return year + "." + month + "." + day + " " + hour + ":" + min + ":" + sec;
}

// 빈 값 체크
function checkEmpty(value){
  if(value == "" || value == null || value == undefined || ( value != null && typeof value == "object" && !Object.keys(value).length )) return 1;
  return 0;
}

// 문자열을 받아서 숫자만 추려낸 뒤 반환
function fn(str){
    return str.toString().replace(/[^0-9]/g,"");
}

// 서울버스 '출발대기' 인 경우 예외처리
function checkWait(sentence){
  if(sentence == '출발대기') return 1;
  return 0;
}

// 서울버스의 남은시간을 받아서 초로 변환하여 반환
function separateTime(sentence){
  // 곧 도착일 경우 30초 남을것으로 가정
  if(sentence == '곧 출발') return 30;
  if(!checkEmpty(fn(sentence))){
    // TODO: sentence가 숫자일 경우
      var section1 = sentence.indexOf('분');
      var str1 = sentence.substring(0, section1);
      var section2 = sentence.indexOf('초');
      var str2 = sentence.substring(section1+1, section2);
      return (parseInt(str1*60) + parseInt(str2));
  }
}
