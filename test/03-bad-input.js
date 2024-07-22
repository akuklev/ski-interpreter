const { expect } = require('chai');
const { SKI } = require('../index');

describe( 'SKI', () => {
    it( 'catches bad input', done => {
        const ski = new SKI();
        expect( () => { ski.parse( 'foo(' ) }).to.throw(/unbalanced/i);
        expect( () => { ski.parse( 'foo)' ) }).to.throw(/unbalanced/i);

        expect( () => { ski.parse( 'S 1 2 3' )}).to.throw(/tokens.*1 2 3/);

        done();
    })
});
