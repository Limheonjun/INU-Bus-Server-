'use strict'
const request = require('supertest');
const should = require('should');
const app = require('../app');

describe('GET /nodeData', ()=>{
    let data;
    before(()=>{
        request(app)
        .get('/location')
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

        it('모든 버스 정보는 \'no\', \'routeid\', \'nodelist\' 프로퍼티를 가져야 한다', ()=>{
            const index = Math.floor(Math.random() * data.length);
            data[index].should.have.keys('no', 'routeid', 'nodelist');
        });

        it('\'nodelist\' 프로퍼티의 길이는 0보다 커야한다', ()=>{
            const index = Math.floor(Math.random() * data.length);
            data[index].nodelist.length.should.above(0);
        });

        it('\'nodelist\'의 원소는 \'nodeid\', \'nodenm\', \'nodeord\', \'vehicleno\' 프로퍼티를 가져야 한다', ()=>{
            const index = Math.floor(Math.random() * data.length);
            const index2 = Math.floor(Math.random() * data[index].nodelist.length);
            data[index].nodelist[index2].should.have.keys('nodeid', 'nodenm', 'nodeord', 'vehicleno');
        });

    }); 
});