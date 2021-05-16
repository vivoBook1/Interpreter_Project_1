const assert = require('assert');
const {test} = require('./test-util');

module.exports = eva => {

// Increment tests:

  test(eva,
  `
    (begin
      (var result 0)
      (++ result)
      result
    )
  `,
  1);

// Decrement tests:

  test(eva,
  `
    (begin
      (var result 1)
      (-- result)
      result
    )
  `,
  0);    

// Inc Val tests:

test(eva,
    `
      (begin
        (var result 0)
        (+= result 5)
        result
      )
    `,
    5);

// Dec Val tests:

test(eva,
    `
      (begin
        (var result 5)
        (-= result 5)
        result
      )
    `,
    0);

// Mul Val tests:

test(eva,
    `
      (begin
        (var result 5)
        (*= result 5)
        result
      )
    `,
    25);

// Div Val tests:

test(eva,
    `
      (begin
        (var result 5)
        (/= result 5)
        result
      )
    `,
    1);

};