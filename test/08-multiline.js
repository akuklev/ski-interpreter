const {expect} = require('chai');
const {SKI} = require('../index');

describe( 'SKI.parse', () => {
    it ('handles comments, definitions, and stuff', done => {
        const ski = new SKI;
        const vars = {};
        const expr = ski.parse(`
            // this is a comment
            dbl = S (S(KS)K) K;;;;
            dbl dbl dbl
        `, vars);
        expect( expr.run(SKI.S).result.toString() ).to.equal(expr.run().result.toString());
        expect(Object.keys(ski.getTerms()).sort()).to.deep.equal(['I', 'K', 'S']);

        expect(vars).to.deep.equal({});

        done();
    });

    it ('makes last expr an alias if = given', done => {
        const ski = new SKI();
        const expr = ski.parse('foo = SKK');
        const [x] = SKI.free('x');

        expect( expr.name ).to.equal ("foo");
        expect( expr.run(x).result).to.equal(x);

        done();
    });

    it ('does not leak intermediate terms', done => {
        const ski = new SKI;
        const [x] = SKI.free('x');
        const jar = { x };
        const intact = { ... jar };
        // console.log(jar);

        const expr = ski.parse('y = SK; z=KI; K', jar);

        expect(jar).to.deep.equal(intact);

        done();
    });

    it('does not allow to define something twice', done => {
        const ski = new SKI();
        expect( () => ski.parse('false = SK; false = KI')).to.throw(/redefine/);

        done();
    });

    it('can co-parseLine terms with same free vars', done => {
        const ski = new SKI;
        const jar = {};
        const xy = ski.parse('x(y)', jar);
        const yx = ski.parse('y(x)', jar);
        const cake = xy.apply(yx);

        expect(cake.equals(ski.parse('x y (y x)', jar))).to.equal(true);
        expect(cake.equals(ski.parse('x y (y x)', {}))).to.equal(false);

        done();
    });

    it('does not display intermediate terms unless added', done => {
        const ski = new SKI;

        // use small letters as we'll make BCKW available by default
        const expr = ski.parse('b = S(KS)K; w = SS(KI); bw = b w');

        expect( expr instanceof SKI.classes.Alias).to.equal(true, 'returns an alias');

        expect(''+expr.impl).to.match(/^[SKI()]*$/, "no traces of b() and w()");

        // just check the expr to work
        expect(expr.run(...SKI.free('x', 'y', 'z')).result.toString()
            ).to.equal('x(y)(z)(z)');

        done();
    });
});
