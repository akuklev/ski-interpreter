export type AnyArity = (arg0: Expr) => Expr | AnyArity;
export class Expr {
    arity: number;
    /**
       * postprocess term after parsing. typically return self but may return other term or die
       * @return {Expr}
       */
    postParse(): Expr;
    /**
       * @desc apply self to zero or more terms and return the resulting term,
       * without performing any calculations whatsoever
       * @param {Expr} args
       * @return {Expr}
       */
    apply(...args: Expr): Expr;
    /**
       * expand all terms but don't perform any calculations
       * @return {Expr}
       */
    expand(): Expr;
    /**
     * @desc return all free variables within the term
     * @return {Set<FreeVar>}
     */
    freeVars(): Set<FreeVar>;
    hasLambda(): any;
    freeOnly(): boolean;
    /**
     * @desc return all terminal values within the term, that is, values not
     * composed of other terms. For example, in S(KI)K, the terminals are S, K, I.
     * @return {Map<Expr, number>}
     */
    getSymbols(): Map<Expr, number>;
    /**
     * @desc rought estimate of the complexity of the term
     * @return {number}
     */
    weight(): number;
    /**
     *
     * @param {{max: number?, maxArgs: number?, bestGuess?: Expr}} options
     * @return {{
     *    found: boolean,
     *    proper: boolean,
     *    arity: number?,
     *    linear: boolean?,
     *    canonical?: Expr,
     *    steps: number?,
     *    skip: Set<number>?
     * }}
     */
    canonize(options?: {
        max: number | null;
        maxArgs: number | null;
        bestGuess?: Expr;
    }): {
        found: boolean;
        proper: boolean;
        arity: number | null;
        linear: boolean | null;
        canonical?: Expr;
        steps: number | null;
        skip: Set<number> | null;
    };
    /**
     * @desc Returns a series of lambda terms equivalent to the given expression,
     *       up to the provided computation steps limit,
     *       in decreasing weight order.
     * @param {{
     *   max: number?,
     *   maxArgs: number?,
     *   varGen: function(void): FreeVar?,
     *   steps: number?,
     *   html: boolean?,
     *   latin: number?,
     * }} options
     * @param {number} [maxWeight] - maximum allowed weight of terms in the sequence
     * @return {IterableIterator<{expr: Expr, steps: number?, comment: string?}>}
     */
    lambdify(options?: {
        max: number | null;
        maxArgs: number | null;
        varGen: (arg0: void) => FreeVar | null;
        steps: number | null;
        html: boolean | null;
        latin: number | null;
    }): IterableIterator<{
        expr: Expr;
        steps: number | null;
        comment: string | null;
    }>;
    /**
     * @desc same semantics as walk() but rewrite step by step instead of computing
     * @param {{max: number?}} options
     * @return {IterableIterator<{final: boolean, expr: Expr, steps: number}>}
     */
    rewriteSKI(options?: {
        max: number | null;
    }): IterableIterator<{
        final: boolean;
        expr: Expr;
        steps: number;
    }>;
    /**
     * @desc Rename free variables in the expression using the given sequence
     *       This is for eye-candy only, as the interpreter knows darn well hot to distinguish vars,
     *       regardless of names.
     * @param {IterableIterator<string>} seq
     * @return {Expr}
     */
    renameVars(seq: IterableIterator<string>): Expr;
    _rski(options: any): this;
    /**
     * @desc Whether the term will reduce further if given more arguments.
     *       In practice, equivalent to "starts with a FreeVar"
     *       Used by canonize (duh...)
     * @return {boolean}
     */
    wantsArgs(): boolean;
    /**
       * Apply self to list of given args.
       * Normally, only native combinators know how to do it.
       * @param {Expr[]} args
       * @return {Expr|null}
       */
    reduce(args: Expr[]): Expr | null;
    /**
       * Replace all instances of free vars with corresponding values and return the resulting expression.
       * return null if no changes could be made.
       * @param {FreeVar} plug
       * @param {Expr} value
       * @return {Expr|null}
       */
    subst(plug: FreeVar, value: Expr): Expr | null;
    /**
       * @desc iterate one step of calculation in accordance with known rules.
       * @return {{expr: Expr, steps: number, changed: boolean}}
       */
    step(): {
        expr: Expr;
        steps: number;
        changed: boolean;
    };
    /**
       * @desc Run uninterrupted sequence of step() applications
       *       until the expression is irreducible, or max number of steps is reached.
       *       Default number of steps = 1000.
       * @param {{max: number?, steps: number?, throw: boolean?}|Expr} [opt]
       * @param {Expr} args
       * @return {{expr: Expr, steps: number, final: boolean}}
       */
    run(opt?: {
        max: number | null;
        steps: number | null;
        throw: boolean | null;
    } | Expr, ...args: Expr): {
        expr: Expr;
        steps: number;
        final: boolean;
    };
    /**
       * Execute step() while possible, yielding a brief description of events after each step.
       * Mnemonics: like run() but slower.
       * @param {{max: number?}} options
       * @return {IterableIterator<{final: boolean, expr: Expr, steps: number}>}
       */
    walk(options?: {
        max: number | null;
    }): IterableIterator<{
        final: boolean;
        expr: Expr;
        steps: number;
    }>;
    /**
       *
       * @param {Expr} other
       * @return {boolean}
       */
    equals(other: Expr): boolean;
    contains(other: any): boolean;
    expect(other: any): void;
    /**
     * @param {{terse: boolean?, html: boolean?}} [options]
     * @return {string} string representation of the expression
     */
    toString(options?: {
        terse: boolean | null;
        html: boolean | null;
    }): string;
    /**
     *
     * @return {boolean}
     */
    needsParens(): boolean;
    /**
     *
     * @return {string}
     */
    toJSON(): string;
}
export namespace Expr {
    let lambdaPlaceholder: Native;
}
export class App extends Expr {
    /**
     * @desc Application of fun() to args.
     * Never ever use new App(fun, ...args) directly, use fun.apply(...args) instead.
     * @param {Expr} fun
     * @param {Expr} args
     */
    constructor(fun: Expr, ...args: Expr);
    fun: Expr;
    args: Expr;
    final: boolean;
    weight(): Expr;
    apply(...args: any[]): any;
    canonize(options?: {}): {
        found: boolean;
        proper: boolean;
        arity: number | null;
        linear: boolean | null;
        canonical?: Expr;
        steps: number | null;
        skip: Set<number> | null;
    };
    renameVars(seq: any): Expr;
    subst(plug: any, value: any): Expr;
    /**
     * @return {{expr: Expr, steps: number}}
     */
    step(): {
        expr: Expr;
        steps: number;
    };
    split(): any[];
    equals(other: any): boolean;
    toString(opt?: {}): string;
}
export class FreeVar extends Named {
    constructor(name: any);
    id: number;
    subst(plug: any, value: any): any;
    toString(opt?: {}): string;
}
export class Lambda extends Expr {
    /**
       * @param {FreeVar|FreeVar[]} arg
       * @param {Expr} impl
       */
    constructor(arg: FreeVar | FreeVar[], impl: Expr);
    arg: FreeVar;
    impl: Expr;
    reduce(input: any): Expr;
    subst(plug: any, value: any): Lambda;
    expand(): Lambda;
    renameVars(seq: any): Lambda;
    _rski(options: any): any;
    equals(other: any): boolean;
    toString(opt?: {}): string;
}
/**
 * @typedef {function(Expr): Expr | AnyArity} AnyArity
 */
export class Native extends Named {
    /**
     * @desc A term named 'name' that converts next 'arity' arguments into
     *       an expression returned by 'impl' function
     *       If an apply: Expr=>Expr|null function is given, it will be attempted upon application
     *       before building an App object. This allows to plug in argument coercions,
     *       e.g. instantly perform a numeric operation natively if the next term is a number.
     * @param {String} name
     * @param {AnyArity} impl
     * @param {{note: string?, arity: number?, canonize: boolean?, apply: function(Expr):(Expr|null) }} [opt]
     */
    constructor(name: string, impl: AnyArity, opt?: {
        note: string | null;
        arity: number | null;
        canonize: boolean | null;
        apply: (arg0: Expr) => (Expr | null);
    });
    impl: AnyArity;
    onApply: (arg0: Expr) => (Expr | null);
    arity: any;
    note: any;
    apply(...args: any[]): Expr;
    _rski(options: any): Expr | this;
    reduce(args: any): any;
}
export class Alias extends Named {
    /**
     * @desc An existing expression under a different name.
     * @param {String} name
     * @param {Expr} impl
     * @param {{canonize: boolean?, max: number?, maxArgs: number?, note: string?, terminal: boolean?}} [options]
     */
    constructor(name: string, impl: Expr, options?: {
        canonize: boolean | null;
        max: number | null;
        maxArgs: number | null;
        note: string | null;
        terminal: boolean | null;
    });
    impl: Expr;
    note: string;
    arity: any;
    proper: any;
    terminal: any;
    canonical: any;
    subst(plug: any, value: any): Expr;
    /**
     *
     * @return {{expr: Expr, steps: number}}
     */
    step(): {
        expr: Expr;
        steps: number;
    };
    reduce(args: any): Expr;
    equals(other: any): any;
    _rski(options: any): Expr;
    toString(opt: any): string;
}
export class Church extends Native {
    constructor(n: any);
    n: any;
    arity: number;
    equals(other: any): boolean;
}
export namespace globalOptions {
    let terse: boolean;
    let max: number;
    let maxArgs: number;
}
export const native: {};
declare class Named extends Expr {
    /**
       * @desc a constant named 'name'
       * @param {String} name
       */
    constructor(name: string);
    name: string;
    toString(): string;
}
export {};
