'use strict'
const request = require('supertest');
const should = require('should');
const app = require('../app');

describe('GET /arrivalInfo', ()=>{
    let data;
    before(()=>{
        request(app)
        .get('/arrivalInfo')
        .expect(200)
        .end((err,res)=>{
            if(err) throw err;
            data = JSON.parse(res.text);
        });
    });

    describe('Success', ()=>{
        it('정류장 정보는 배열 이어야 한다', ()=>{
            data.should.be.an.Array();
        });

        it('모든 정류장 정보는 \'name\', \'data\' 프로퍼티를 가져야 한다', ()=>{
            const index = Math.floor(Math.random() * data.length);
            data[index].should.have.keys('name', 'data');
        });

        it('첫번째 정류장의 이름은 \'frontgate\' 이어야 한다', ()=>{
            data[0].should.have.value('name', 'frontgate');
        });

        it('두번째 정류장의 이름은 \'science\' 이어야 한다', ()=>{
            data[1].should.have.value('name', 'science');
        });

        it('세번째 정류장의 이름은 \'engineer\' 이어야 한다', ()=>{
            data[2].should.have.value('name', 'engineer');
        });

        it('정류장에 버스 데이터가 있는 경우 버스 데이터는 모든 정류장 정보는 \'no\', \'arrival\', \'start\', \'end\', \'interval\', \'type\' 프로퍼티를 가져야 한다', ()=>{
            data[0].data[0].should.have.keys( 'no', 'arrival', 'start', 'end', 'interval', 'type');
        });
    }); 
});