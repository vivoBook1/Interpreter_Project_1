//  Eva Programming language

//  AST interpreter

const assert = require('assert');
const Environment = require('./Environment');

const { env } = require('process');
const { isString } = require('util');

const Transformer = require('./transform/Transformer');

const evaParser = require('./parser/evaParser');

const fs = require('fs');

// Eva Interpreter

class Eva {

// Creates an Eva instance with the global environment

    constructor(global = GlobalEnvironment){
        this.global = global;
        this._transformer = new Transformer();
    }

// Evaluates global code wrapping into a block

    evalGlobal(exp) {
       //return this.eBlock(expressions, this.global);
       return this.evalBody(exp, this.global);
    }

// Evaluates an expression in the given environment

    eval(exp, env = this.global) {

//-----------------------------------------------------------------------------
// Self-evaluating expressions:

        if(this.isNo(exp)) {
           
            return exp;
        }

        if(this.isStr(exp)) {
            return exp.slice(1,-1);
        }

        /*
//------------------------------------------------------------------------------
// Math Operations:

        if(exp[0] === '+') {
            return this.eval(exp[1], env) + this.eval(exp[2], env);
        }

        if(exp[0] === '-') {
            return this.eval(exp[1], env) - this.eval(exp[2], env);
        }

        if(exp[0] === '*') {
            return this.eval(exp[1], env) * this.eval(exp[2], env);
        }

        if(exp[0] === '/') {
            return this.eval(exp[1], env) / this.eval(exp[2], env);
        }

        if(exp[0] === '%') {
            return this.eval(exp[1], env) % this.eval(exp[2], env);
        }

//------------------------------------------------------------------------------
// Comparison Operations:

        if(exp[0] === '>') {
            return this.eval(exp[1], env) > this.eval(exp[2], env);
        }

        if(exp[0] === '<') {
            return this.eval(exp[1], env) < this.eval(exp[2], env);
        }

        if(exp[0] === '>=') {
            return this.eval(exp[1], env) >= this.eval(exp[2], env);
        }

        if(exp[0] === '<=') {
            return this.eval(exp[1], env) <= this.eval(exp[2], env);
        }

        if(exp[0] === '==') {
            return this.eval(exp[1], env) === this.eval(exp[2], env);
        }

        */


//------------------------------------------------------------------------------
// Block: Evaluating expressions:

        if(exp[0] === 'begin') {
            const blockEnv = new Environment({}, env);
            return this.eBlock(exp, blockEnv);
        }

//------------------------------------------------------------------------------
// Variables Decelaration:

        if(exp[0] === 'var') {
                const [_, name, value] = exp;
                return env.define(name, this.eval(value,env));
        }

//------------------------------------------------------------------------------
// Variables update:

        if(exp[0] === 'set') {
                const [_, ref, value] = exp;

                // Assignment to a property:

                if(ref[0] === 'prop') {
                    const [_tag, instance, propName] = ref;
                    const instanceEnv = this.eval(instance, env);

                    return instanceEnv.define(
                        propName,
                        this.eval(value, env)
                    );
                }

                // simple assignment:
                return env.assign(ref, this.eval(value,env));
        }

//------------------------------------------------------------------------------
// Variables Access:

        if(this.isVariableName(exp)) {

            return env.lookup(exp);
        }

//-----------------------------------------------------------------------------------
// if-expressions:

        if(exp[0] === 'if') {
            const [_tag, condition, consequent, alternate] = exp;
            if(this.eval(condition, env)) {
                return this.eval(consequent, env);
            }

            return this.eval(alternate, env);
        }

//-----------------------------------------------------------------------------------
// while-expressions:

        if(exp[0] === 'while') {
            const [_tag, condition, body] = exp;
            let result;

            while(this.eval(condition, env)){
                result = this.eval(body, env);
            }

            return result;
        }

//-----------------------------------------------------------------------------------------
// Function Decelarations: (def sqaure (x) (* x x))
//
// Syntactic Sugar: (var square (lambda x (* x x)))

        if(exp[0] === 'def') {

            // JIT - transpile to a variable decelaration

            const varExp = this._transformer.transformDefToLambda(exp);

            return this.eval(varExp, env);

        }

//-----------------------------------------------------------------------------------------
// Switch expression:
//
// Syntactic Sugar for nested if expressions:

        if(exp[0] === 'switch') {
            const ifExp = this._transformer.transformSwitchToIf(exp);

            return this.eval(ifExp, env);
        }

//--------------------------------------------------------------------------------------------
// For loop expression:
//
// Syntactic sugar for while loop expressions:

        if(exp[0] === 'for') {
            const whileExp = this._transformer.transformForToWhile(exp);

            return this.eval(whileExp, env);
        } 

//-----------------------------------------------------------------------------------------
// increment opeartion:
//
// Syntactic Sugar for setting a value:

if(exp[0] === '++') {
    const setExp = this._transformer.transformIncToSet(exp);

    return this.eval(setExp, env);
}

//-----------------------------------------------------------------------------------------
// decrement opeartion:
//
// Syntactic Sugar for setting a value:

if(exp[0] === '--') {
    const setExp = this._transformer.transformDecToSet(exp);

    return this.eval(setExp, env);
}

//-----------------------------------------------------------------------------------------
// Short-hand + opeartion:
//
// Syntactic Sugar for setting a value:

if(exp[0] === '+=') {
    const setExp = this._transformer.transformIncValToSet(exp);

    return this.eval(setExp, env);
}

//-----------------------------------------------------------------------------------------
// Short-hand - opeartion:
//
// Syntactic Sugar for setting a value:

if(exp[0] === '-=') {
    const setExp = this._transformer.transformDecValToSet(exp);

    return this.eval(setExp, env);
}

//-----------------------------------------------------------------------------------------
// Short-hand * opeartion:
//
// Syntactic Sugar for setting a value:

if(exp[0] === '*=') {
    const setExp = this._transformer.transformMulValToSet(exp);

    return this.eval(setExp, env);
}

//-----------------------------------------------------------------------------------------
// Short-hand / opeartion:
//
// Syntactic Sugar for setting a value:

if(exp[0] === '/=') {
    const setExp = this._transformer.transformDivValToSet(exp);

    return this.eval(setExp, env);
}

//----------------------------------------------------------------------------------------
// Lambda functions:

        if(exp[0] === 'lambda') {
            const [_tag, params, body] = exp;

            return {
                params,
                body,
                env, //Closure
            };
        }

//-----------------------------------------------------------------------------------------
// Class Decelarations:

        if(exp[0] === 'class') {
            const [_tag, name, parent, body] = exp;

            const parentEnv = this.eval(parent, env) || env;
            
            const classEnv = new Environment({}, parentEnv);

            // Body is evaluated in Class Environment

            this.evalBody(body, classEnv);

            // Class is accessible by name

            return env.define(name, classEnv);
        }

//-----------------------------------------------------------------------------------------
// Super expressions:

        if(exp[0] === 'super') {
            const[_tag, className] = exp;
            return this.eval(className, env).parent;
        }

//-----------------------------------------------------------------------------------------
// Class instaniation:

        if(exp[0] === 'new') {

            const classEnv = this.eval(exp[1], env);

            // An instance of a class in an environment
            // The 'parent' compoenet of an the instance environment is set to its class

            const instanceEnv = new Environment({}, classEnv);

            const args = exp.slice(2).map(arg => this.eval(arg, env));

            this.callUserDefinedFun(classEnv.lookup('constructor'),
            [instanceEnv, ...args]);

            return instanceEnv;

        }

//-----------------------------------------------------------------------------------------
// property access:

       if(exp[0] === 'prop') {
            const [_tag, instance, name] = exp;

            const instanceEnv = this.eval(instance, env);

            return instanceEnv.lookup(name);

            /* This probably returns an object generated from the return statement of lambda function
            like {params, body, env}.
            this whole object is given in return to probably the isArray part as exp[0]
            the other part is the argument which is passed i.e. exp[1] and remaining.
            eg. this is the expression which probably led to all this
            eg. 1) ((prop p calc) p)  ----- Class-test
            eg. 2) ((prop math abs) (- 10)) ------ import-test
            */
        }
 
//-----------------------------------------------------------------------------------------
// Module decelaration:

        if(exp[0] === 'module') {
            const [_tag, name, body] = exp;

            //const moduleEnv = new Environment({}, env);
            const moduleEnv = new Environment({}, env);

            this.evalBody(body, moduleEnv);

           // const midEnv = new Environment({}, null);
            if(moduleEnv.record.hasOwnProperty(name)) {
                return env.define(name, moduleEnv.record[name]);
            }


           // return env.define(name, midEnv);
            return env.define(name, moduleEnv);
        }

//-----------------------------------------------------------------------------------------
// Module import:

        if(exp[0] === 'import') {

            if(exp.length == 2) {

            const [_tag, name] = exp;

          /*  if((this.global).record.hasOwnProperty(name)) {
                return;
            } */ // Caching layer. (check if correct implementation)

            const moduleSrc = fs.readFileSync(`${__dirname}/modules/${name}.eva`, 'utf-8',);

            const body  = evaParser.parse(`(begin ${moduleSrc})`);

            const moduleExp = ['module', name, body];

           /* const bufferEnv = new Environment({}, this.global);

            return this.eval(moduleExp, bufferEnv); */

            return this.eval(moduleExp, this.global);

        }

            const [_tag, funm, name] = exp;

            const moduleSrc = fs.readFileSync(`${__dirname}/modules/${name}.eva`, 'utf-8',);

            const body  = evaParser.parse(`(begin ${moduleSrc})`);

            const moduleExp = ['module', name, body];

            const bufferEnv = new Environment({}, this.global);

            const fenv = this.eval(moduleExp, bufferEnv); // fenv here is moduleEnv returned from module (check is true)

            //const fenv = this.eval(moduleExp, this.global);

            //env.define(funm, fenv.lookup(funm));

            const barbadiEnv = new Environment({}, null);

            funm.forEach(funa => {
                barbadiEnv.define(funa, fenv.lookup(funa));
                env.define(funa, fenv.lookup(funa));
                // (this.global).define(funa, fenv.lookup(funa)); --- this one or upper one, see which one is correct.
            });       
            
        // Optimize this whole block

            return env.define(name, barbadiEnv);

          /* funm.forEach(funa => {
                env.define(funa, fenv.lookup(funa));
                // (this.global).define(funa, fenv.lookup(funa)); --- this one or upper one, see which one is correct.
            }); */
        
            //return;
    }

//-----------------------------------------------------------------------------------------
// Module exports:

         if(exp[0] === 'exports') {

            if(exp.length === 2) {
                return;
            }
            
            const [_tag, name, ...funs] = exp;

            const bufEnv = new Environment({}, this.global);

            funs.forEach(funame => {
                (bufEnv).define(funame, env.lookup(funame));
            });

            env.define(name, bufEnv); 
             
            return;
        } 

//-----------------------------------------------------------------------------------------
// Function Calls:

       if(Array.isArray(exp)) {

                
            const fn = this.eval(exp[0], env);

            const args = exp.slice(1).map(arg => this.eval(arg, env));

            // 1. Native function:

            if(typeof fn === 'function') {
               
                return fn(...args);
            }

            // 2. User-defined function:

            return this.callUserDefinedFun(fn, args);

        }

        throw `Unimplemented ${JSON.stringify(exp)}`;
    }


//----------------------------------------------------------------------------------

    callUserDefinedFun(fn, args) {

        const activationRecord = {};

        fn.params.forEach((param, index) =>{
            activationRecord[param] = args[index];
        });

        const activationEnv = new Environment(activationRecord, 
            fn.env // Static scope
            );

        return this.evalBody(fn.body, activationEnv);

    }

    evalBody(body, env) {
        if(body[0] === 'begin') {
            return this.eBlock(body, env);
        }
        return this.eval(body, env);
    }

    eBlock(block, env) {
        let result;
    
        const [_tag, ...expressions] = block;
    
        expressions.forEach(exp => {
            result = this.eval(exp, env);
        });
    
        
        return result;
    }

    isNo(exp) {
        return (typeof exp) === 'number';
    }
    
    isStr(exp) {
        return (typeof exp) === 'string' && exp[0] === '"' && exp.slice(-1) === '"';
    }
    
    isVariableName(exp) {
        return (typeof exp) === 'string' && /^[+\-*/<>=a-zA-Z][+\-*/<>=a-zA-z0-9_]*$/.test(exp);  
    }
}

const GlobalEnvironment = new Environment({
    null: null,

    true: true,
    false: false,

    VERSION: '0.1',

    // Math Operators:

    '+'(op1, op2) {
        
        return op1 + op2;
    },

    '-'(op1, op2 = null) {
        if(op2 == null)
        return -op1;

        return op1 - op2;
    },

    '*'(op1, op2) {
        
        return op1 * op2;
    },

    '/'(op1, op2) {
        return op1 / op2;
    },

    '%'(op1, op2) {
        return op1 % op2;
    },

    // Comparison Operators:

    '>'(op1, op2) {
        return op1 > op2;
    },

    '<'(op1, op2) {
        return op1 < op2;
    },

    '>='(op1, op2) {
        return op1 >= op2;
    },

    '<='(op1, op2) {
        return op1 <= op2;
    },

    '=='(op1, op2) {
        return op1 === op2;
    },

    // Console ouptut

    print(...args) {
        console.log(...args);
    },

});


module.exports = Eva;