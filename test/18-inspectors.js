const { expect } = require('chai');
const { SKI } = require('../index');
const {Church} = require("../lib/expr");

describe( 'interventions', () => {
    const ski = new SKI();

    it ('can detect and coerce numbers', () => {
        const coerce = ski.parse('x -> !nat x');

        coerce.run(ski.parse('4 5')).expr.expect(new Church(625));
        expect( () => coerce.run(ski.parse('S'))).to.throw(/Church .*coercion .*not a number/);

    });

    it ('cannot be fooled by sophisticated combinators', () => {
        ski.parse('!nat (B(B(W))(B(B(C(K))))(20))').run().expr.expect(SKI.church(0));
    });

    it ('allows long computations', () => {
        ski.parse('!nat (13 (S(S(KS)K)I) )').run().expr.expect(SKI.church(2**13));
    });

    it ('rejects unknown terms', () => {
        expect( () => ski.parse('x->!foobar x') ).to.throw(/[Uu]nknown.*!foobar\b/);
    });

    it ('catches infinite loops', () => {
        expect( () => console.log(ski.parse('!nat( S(K(SII))(K(SII)) )').run()) )
            .to.throw(/Church.*coercion.*terminate/);
    });

})
