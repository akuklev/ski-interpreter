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
     *
     * @return {Set<FreeVar>}
     */
    freeVars(): Set<FreeVar>;
    /**
     * @desc rought estimate of the complexity of the term
     * @return {number}
     */
    weight(): number;
    /**
     *
     * @param {{max: number?, maxArgs: number?}} options
     * @return {{arity: number?, found: boolean, proper: boolean, canonical?: Expr, skip: Set<number>?}}
     */
    guessArity(options?: {
        max: number | null;
        maxArgs: number | null;
    }): {
        arity: number | null;
        found: boolean;
        proper: boolean;
        canonical?: Expr;
        skip: Set<number> | null;
    };
    hasOnly(set: any): any;
    hasReduction(): boolean;
    /**
       * Apply self to list of given args.
       * Normally, only native combinators know how to do it.
       * @param {Expr[]} args
       * @return {Expr|null}
       */
    reduce(args: Expr[]): Expr | null;
    /**
       * Replace all instances of free vars with corresponding values and return the resulting expression.
       * return nulls if no changes could be made, just like step() does, to save memory.
       * @param {FreeVar} plug
       * @param {Expr} value
       * @return {Expr|null}
       */
    subst(plug: FreeVar, value: Expr): Expr | null;
    /**
       * @desc iterate one step of calculation in accordance with known rules.
       *       return the new expression if reduction was possible. or null otherwise
       * @return {{expr: Expr, steps: number}}
       */
    step(): {
        expr: Expr;
        steps: number;
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
    expect(other: any): void;
    /**
     * @param {{terse: boolean?}} options
     * @return {string} string representation of the expression
     */
    toString(options?: {
        terse: boolean | null;
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
export class App extends Expr {
    /**
       * @desc Application of fun() to args
       * @param {Expr} fun
       * @param {Expr} args
       */
    constructor(fun: Expr, ...args: Expr);
    fun: Expr;
    args: Expr;
    final: boolean;
    weight(): Expr;
    hasOnly(set: any): boolean;
    apply(...args: any[]): any;
    subst(plug: any, value: any): Expr;
    equals(other: any): boolean;
    toString(opt?: {}): string;
}
export class FreeVar extends Named {
    constructor(name: any);
    id: number;
    subst(plug: any, value: any): any;
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
    equals(other: any): boolean;
    toString(opt?: {}): string;
}
export class Native extends Named {
    /**
     * @desc A term named 'name' that converts next 'arity' arguments into
     *       an expression returned by 'impl' function
     *       If an apply: Expr=>Expr|null function is given, it will be attempted upon application
     *       before building an App object. This allows to plug in argument coercions,
     *       e.g. instantly perform a numeric operation natively if the next term is a number.
     * @param {String} name
     * @param {Number} arity
     * @param {function(...Expr): Expr} impl
     * @param {{note: string?, skip: Array<number>?, apply?: (expr)=>expr|null}} opt
     */
    constructor(name: string, arity: number, impl: (...args: Expr[]) => Expr, opt?: {
        note: string | null;
        skip: Array<number> | null;
        apply?: (expr: any) => any | null;
    });
    impl: (...arg0: Expr[]) => Expr;
    skip: any;
    note: string;
    onApply: (expr: any) => any | null;
    apply(...args: any[]): Expr;
    reduce(args: any): Expr;
}
export class Alias extends Named {
    /**
       * @desc An existing expression under a different name.
       * @param {String} name
       * @param {Expr} impl
       */
    constructor(name: string, impl: Expr);
    impl: Expr;
    skip: Set<number>;
    proper: boolean;
    canonical: Expr;
    subst(plug: any, value: any): Expr;
    reduce(args: any): Expr;
    equals(other: any): any;
    toString(opt: any): string;
}
export class Church extends Native {
    constructor(n: any);
    n: any;
    equals(other: any): boolean;
}
export namespace globalOptions {
    let terse: boolean;
    let max: number;
    let maxArgs: number;
}
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
