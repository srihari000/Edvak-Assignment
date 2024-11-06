const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('./index.js');
const { expect } = chai;

chai.use(chaiHttp);

describe('Rate Limiting', () => {
    it('should allow requests within limit', async () => {
        for (let i = 0; i < 100; i++) {
            const res = await chai.request(app).get('/').set('user-id', 'testUser');
            expect(res).to.have.status(200);
        }
    });

    it('should block requests beyond user limit', async () => {
        for (let i = 0; i < 101; i++) {
            const res = await chai.request(app).get('/').set('user-id', 'testUser');
            if (i < 100) {
                expect(res).to.have.status(200);
            } else {
                expect(res).to.have.status(429);
                expect(res.body).to.have.property('error', 'Too Many Requests for user testUser');
            }
        }
    });

    it('should block requests beyond IP limit', async () => {
        for (let i = 0; i < 201; i++) {
            const res = await chai.request(app).get('/').set('user-id', `testUser${i}`);
            if (i < 200) {
                expect(res).to.have.status(200);
            } else {
                expect(res).to.have.status(429);
                expect(res.body).to.have.property('error').that.include('Too Many Requests for IP');
            }
        }
    });

});
