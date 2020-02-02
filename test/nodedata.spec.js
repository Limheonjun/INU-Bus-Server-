'use strict'
const request = require('supertest');
const should = require('should');
const app = require('../app');

describe('GET /nodeData', ()=>{
    let data;
    before(()=>{
        request(app)
        .get('/nodeData')
        .expect(200)
        .end((err,res)=>{
            if(err) throw err;
            data = JSON.parse(res.text);
        });
    });
    describe('Success', ()=>{
        it('버스 정보는 배열 이어야 한다', ()=>{
            data.should.be.an.Array();
        });
        
        it('버스 정보의 갯수가 16개 이어야 한다', ()=>{
            data.should.have.length(16);
        });

        it('모든 버스 정보는 \'no\', \'routeid\', \'nodelist\', \'turnnode\', \'start\', \'end\', \'type\' 프로퍼티를 가져야 한다', ()=>{
            const index = Math.floor(Math.random() * 16);
            data[index].should.have.keys('no', 'routeid', 'nodelist', 'start', 'end', 'type');
        });

        it('\'nodelist\' 프로퍼티의 길이는 0보다 커야한다', ()=>{
            const index = Math.floor(Math.random() * 16);
            data[index].nodelist.length.should.above(0);
        });

        it('\'nodelist\'의 원소는 \'nodeno\', \'nodenm\' 프로퍼티를 가져야 한다', ()=>{
            const index = Math.floor(Math.random() * 16);
            const index2 = Math.floor(Math.random() * data[index].nodelist.length);
            data[index].nodelist[index2].should.have.keys('nodeno', 'nodenm');
        });

    }); 
});