const { expect } = require('chai');
const { SKI } = require('../index');

describe( 'SKI', () => {
    it( 'catches bad input', done => {
        const ski = new SKI({numbers: false, lambdas: false, allow: 'SKI'});
        expect( () => { ski.parseLine( 'foo(' ) }).to.throw(/unbalanced/i);
        expect( () => { ski.parseLine( 'foo)' ) }).to.throw(/unbalanced/i);

        expect( () => { ski.parseLine( 'S ~ **' )}).to.throw(/tokens.*~ \*\*/);
        expect( () => { ski.parseLine( 'S 1 2 3' )}).to.throw(/numbers.*not supported/);

        expect( () => { ski.parseLine('\\%')}).to.throw(/tokens.*starting with [\\]*%/);

        expect (() => { ski.parseLine('')}).to.throw(/ttempt to .* \(\)/);
        expect (() => { ski.parseLine('SK()')}).to.throw(/ttempt to .* \(\)/);

        done();
    })
});
