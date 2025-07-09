const { expect } = require('chai');
const { SKI } = require('../index');

describe( 'SKI.*', () => {
  it('provides essential constants', done => {
    const {S, K, I} = SKI;
    expect( S.apply(K).apply(K).apply(I).run().expr.toString() ).to.equal('I');

    done();
  });

  it('provides free vars & Church numbers', done => {
    expect (
      SKI.church(5).apply(...SKI.free('x', 'y')).run().expr.toString({terse: false})
    ).to.equal('x(x(x(x(x(y)))))');
    done();
  });
})
