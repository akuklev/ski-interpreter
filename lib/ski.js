/**
 * Combinatory logic simulator
 */

class Ast {
  /**
   * @desc apply self to zero or more terms and return the resulting term,
   * without performing any calculations whatsoever
   * @param args
   * @return {Ast}
   */
  combine (...args) {
    return args.length > 0 ? new Call(this, args) : this;
  }

  /**
   * @desc iterate one step of calculation in accordance with known rules
   * @return {Ast|null}
   */
  step () { return null }

  /**
   * @desc Run step() until either no more substitutions can be done, or maximum number
   * of steps is reached. throws an error in the latter case.
   * @param {Number} max
   * @return {Ast}
   */
  run (max = 1000) {
    let expr = this;
    for (let i = 0; i < max; i++) {
      const next = expr.step();
      if (!next)
        return expr;
      expr = next;
    }
    throw new Error('Failed to resolve expression in ' + max + ' steps');
  }

  /**
   * @desc returns string representation of the implementation of the term at hand
   * @return {string}
   */
  getImpl () { return this.toString() }

  /**
   * @return {string} string representation of the expression
   */
  toString () {
    throw new Error( 'toString() undefined for generic AST' );
  }
}

class Call extends Ast {
  /**
   * @desc Application of fun() to args
   * @param {Ast} fun
   * @param {Ast[]} args
   */
  constructor (fun, args) {
    super();
    this.fun = fun;
    this.args = args;
  }

  combine (...args) {
    if (args.length === 0)
      return this;
    return new Call(this.fun, [...this.args, ...args]);
  }

  /**
   * @desc Recursively calculates all terms in the expression. If nothing has to be done,
   * tries to apply the first n-ary term to first n arguments.
   * @return {Ast|null}
   */
  step () {
    // if subtrees changed, return new self
    let change = 0;
    const f = this.fun.step();
    if (f)
      change++;
      // console.log("change in function: "+this.fun + " => " + f);

    // console.log("this.args = ", this.args);
    const args = [];
    for (const x of this.args) {
      const next = x.step();
      args.push(next ?? x);
      if (next)
        change++;
        // console.log("change in arg: "+x+" => "+next);
    }

    if (change)
      return (f ?? this.fun).combine(...args);

    // if nothing has changed, but there's known combinator, reduce it
    if (this.fun instanceof Special && this.args.length >= this.fun.arity) {
      const args = [...this.args]; // shallow copy
      const enough = args.splice(0, this.fun.arity);
      const result = this.fun.impl(...enough)
      // console.log("step: apply "+this.fun+" to "+enough.join(", ")+" => "+result);
      return result.combine(...args);
    }

    // no change whatsoever
    return null;
  }

  toString () {
    return this.fun.toString() + this.args.map(x => '(' + x + ')').join('');
  }
}

class Value extends Ast {
  /**
   * @desc a constant named 'name'
   * @param {String} name
   */
  constructor (name) {
    super();
    this.name = name;
  }

  getImpl () {
    return 'constant';
  }

  toString () {
    return this.name;
  }
}

class Special extends Value {
  /**
   * @desc A term named 'name' that converts next 'arity' arguments into
   *       an expression returned by 'impl' function
   * @param {String} name
   * @param {Number} arity
   * @param {function(...Ast): Ast} impl
   */
  constructor (name, arity, impl) {
    super(name);
    this.arity = arity;
    this.impl  = impl;
  }

  getImpl () {
    return 'native';
  }
}

class Empty extends Ast {
  combine (...args) {
    return args.length ? args.shift().combine(...args) : this;
  }

  toString () {
    return '<empty>';
  }
}

class Alias extends Value {
  /**
   * @desc An existing expression under a different name.
   * @param {String} name
   * @param {Ast} impl
   */
  constructor (name, impl) {
    super(name);
    this.impl = impl;
  }

  combine (...args) {
    return this.impl.combine(...args);
  }

  step () {
    return this.impl;
  }

  getImpl () {
    return this.impl.toString();
  }
}

class SKI {
  constructor () {
    // TODO options, e.g. allow BCW combinators
    this.known = {};

    this.add('I', [1, x => x], 'I x -> x');
    this.add('K', [2, (x, _) => x], 'K x y -> x');
    this.add('S', [3, (x, y, z) => x.combine(z).combine(y.combine(z))],
      'S x y z -> x(z)(y(z))');
  }

  /**
   *
   * @param {String} name
   * @param {Ast|String|[number, (...Ast[]) => Ast]} impl
   * @param {String} [descr]
   * @return {SKI} chainable
   */
  add (name, impl, note = '') {
    if (typeof impl === 'string')
      impl = new Alias( name, this.parse(impl));
    else if (Array.isArray(impl))
      impl = new Special(name, impl[0], impl[1]);
    else if (impl instanceof Ast)
      impl = new Alias( name, impl )
    else
      throw new Error('add: impl must be an Ast, a string, or a [arity, impl] pair');

    impl.note = note;
    this.known[name] = impl;

    return this;
  }

  /**
   * @desc returns a hash of known terms
   * @return {Object}
   */
  list () {
    const out = {};
    for (const name in this.known) {
      const entry = this.known[name];
      out[name] = {
        name,
        impl:  entry.getImpl(),
        note:  entry.note,
        arity: entry.arity,
      }
    }
    return out;
  }

  /**
   *
   * @param {String} str S(KI)I
   * @return {Ast} parsed expression
   */
  parse (str) {
    const rex = /([()A-Z]|[a-z_][a-z_0-9]*)|\s+|($)/sgy;

    const split = [...str.matchAll(rex)];

    const eol = split.pop();
    if (eol[2] !== '')
      throw new Error('Unknown tokens in string starting with ' + str.substring(eol.index));

    // TODO die if unknown non-whitespace

    const tokens = split.map(x => x[1]).filter(x => typeof x !== 'undefined');

    const empty = new Empty();
    const stack = [empty];

    for ( const c of tokens) {
      // console.log("parse: found "+c+"; stack =", stack.join(", "));
      if (c === '(')
        stack.push(empty);
      else if ( c === ')') {
        if (stack.length < 2)
          throw new Error('unbalanced input: ' + str);
        const x = stack.pop();
        const f = stack.pop();
        stack.push(f.combine(x));
      } else {
        const f = stack.pop();
        const x = this.known[c] ?? new Value(c);
        // console.log("combine", f, x)
        stack.push(f.combine(x));
      }
    }

    if (stack.length !== 1)
      throw new Error('unbalanced input: ' + str);

    return stack[0];
  }
}

module.exports = { SKI };
