const assert = require('assert');
const testUtil = require('./test-util.js');

/*  if <condition>
       <consequent>
       <alternate>
*/

module.exports = eva => {
    assert.strictEqual(eva.eval(
        ['begin',
    
        ['var', 'x', 10],
        ['var', 'y', 20],

        ['if', ['>', 'x', 'y'], 
            ['set', 'y', 30],
            ['set', 'y', 40]
        ],

        'y'
    
        ]), 40);
};