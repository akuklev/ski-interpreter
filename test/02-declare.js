const { expect } = require('chai');
const { SKI } = require('../index');

describe( 'SKI', () => {
    it('can declare terms', done => {
        const ski = new SKI;
        ski.add('T', 'S(K(SI))K');

        const term = ski.parseLine('T x y');

        const result = term.run();

        expect( ''+result.expr).to.equal('y(x)');

        // console.log(ski.list());

        done();
    });

    it('does not overwrite read-only data', done => {
        const ski = new SKI;
        ski.add('sub', 'S', 'just an alias');

        const known = ski.getTerms();

        expect (known.S.note).to.match(/x.*y.*z.*->.*x.*z.*\(y.*z\)/);
        expect (known.sub.note).to.equal('just an alias');

        let expr = known.sub;
        expect( expr ).to.be.instanceof( SKI.classes.Alias );
        expr = expr.expand();
        expect( expr  ).to.be.instanceof( SKI.classes.Native );

        done();
    });

    it('can perform some complex computations, correctly', done => {
        const ski = new SKI();
        ski.add('inc', ski.parse('S(S(K(S))(K))'));
        ski.add('n2', 'inc I');
        const expr = ski.parseLine('n2 n2 n2 x y');

        const canonic = expr.expand();
        expect( ''+canonic ).to.match(/^[SKI()]+\(x\)\(y\)$/);

        const result = expr.run( 10000).expr;
        expect( (''+result).replace(/[() ]/g, '') )
            .to.equal('x'.repeat(16)+'y');

        const alt = canonic.run(10000).expr;
        expect(''+alt).to.equal(''+result);

        done();
    });
});
