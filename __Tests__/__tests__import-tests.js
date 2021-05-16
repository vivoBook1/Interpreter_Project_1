const assert = require('assert');
const {test} = require('./test-util');

module.exports = eva => {


   test(eva,
  `
    (import math)
    ((prop math abs) (- 10))
  `,
  10);  

   test(eva,
    `
    (import (abs) math)
      ((prop math abs) (- 10))
    `,
  10)   

  // The below test is before the (import math) cause this test would otherwise overwrite the 
  // (import math) test i.e. math will be overwritten in global and you won't be 
  // able to use MAX_VALUE since now math only consists of abs and sq.
  // Hence import math is written after this below tests. 




/*   test(eva,
    `
      (import (abs square) math)
      (square (- 2))
    `,
  4); */



// After executing this test, the math was overridden which was defined in global in the first test.
 
  test(eva,
    `
      (import math)
      ((prop math abs) (- 10))
    `,
    10); 

    test(eva,
    `
      (var abs (prop math abs))
      (abs (- 10))
    `,
    10); 
  
  
    test(eva,
    ` 
      (prop math MAX_VALUE)
    `,
    1000); 

    // This below test should not run since square is not 'exported' from the math module
 /*   test(eva,
      `
        (var sqr (prop math square))
        (sqr 2)
      `,
      4);  */

};