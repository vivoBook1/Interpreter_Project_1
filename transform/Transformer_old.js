/*
  AST Transformer
*/

class Transformer {

    /* Transforms 'def' expression (function decelaration)
    into a variable decelaration with a lambda expression */  

    transformDefToLambda(defExp) {
        const [_tag, name, params, body] = defExp;
        return ['var', name, ['lambda', params, body]];
    }

    /* Transform switch to nested if expression */

    transformSwitchToIf(switchExp) {
      const[_tag, ...cases] = switchExp;

      const ifExp = ['if', null, null, null];

      let current = ifExp;

      for(let i = 0; i < cases.length - 1; i++) {
        const [currentCond, currentBlock] = cases[i];

        current[1] = currentCond;
        current[2] = currentBlock;

        const next = cases[i+1];
        const [nextCond, nextBlock] = next;

        current[3] = nextCond === 'else'
          ? nextBlock
          : ['if'];

          current = current[3];
      }
      return ifExp;
    }
  
    transformIncToSet(incExp) {

      const [_tag, exp] = incExp;
      return ['set', exp, ['+', exp, 1]];
    
    }

    transformIncToSet(incExp) {

      const [_tag, exp] = incExp;
      return ['set', exp, ['+', exp, 1]];
    
    }

    transformForToWhile(forExp) {
      const[_tag, init, condition, modifier, exp] = forExp;

      const whileExp = ['begin', init, 'while', condition, 'begin', exp, modifier];

      return whileExp;

    } 





}

module.exports = Transformer;