const { expect } = require('chai');
const { SKI } = require('../index');

describe('Expr.ski()', () => {
  const predictable = [
    ['x->y->x', 'K'],
    ['x->y->z->x z (y z)', 'S'],
    ['x->x', 'I'],
    ['x->x x', 'SII'],
    ['x->y->y x', 'S(K(SI))K'],
  ];
  const canonical = [
    'C',
    'B',
    'W',
    'BC(CI)',
    '5',
  ];

  const ski = new SKI();

  for (const [got, expected] of predictable) {
    it(`${got} -> ${expected}`, () => {
      ski.parse(expected).expect(ski.parse(got).rewriteSKI());
    });
  }
  for (const src of canonical) {
    const canon = ski.parse(src).guessArity().canonical;
    it(`round trips for ${src} aka ${canon}`, () => {
      const bare = canon.rewriteSKI();
      canon.expect(bare.guessArity().canonical);
    });
  }
});
