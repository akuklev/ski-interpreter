#!/usr/bin/env -S node --stack-size=10300

const { SKI } = require ('../index');

const ski = new SKI();
ski.add('inc', 'S(S(K(S))(K))');
ski.add('n2', 'inc I');

const expr = ski.parse('(inc n2 n2 inc (n2 n2)) n2 x y');
const depth = 2**12;
const expect = 'x('.repeat(depth)+'y'+')'.repeat(depth);

const iter = 20;
let steps = 0;

const t0 = new Date();
for (let i = 0; i < iter; i++) {
    const result = expr.run({max: 10000000});
    if (result.expr.toString({terse: false}) !== expect)
        console.log('warning: unexpected output: \n'+result.expr);
    steps += result.steps;
}
const elapsed = new Date() - t0;

console.log("total steps: "+steps);
console.log("time per iteration: "+(elapsed / iter)+'ms');
