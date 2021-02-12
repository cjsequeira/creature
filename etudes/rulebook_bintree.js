'use strict'

// ****** Code to test implementation of a rulebook as a binary tree

const ruleBook = {
  func: (x) => x > 5,
  left: {
    func: (x) => x > 10,
    left: {
      func: (x) => x > 15,
      left: {func: () => "greater than 15"},
      right: {func: () => "in (10, 15]"}
    },
    right: {func: () => "in (5, 10]"}
  },
  right: {func: () => "in (-inf, 5]"}
};

const traverse = (node, arg) => {
  console.log(node.func.toString());
  let funcResult = node.func(arg);

  switch (funcResult) {
    case true:
      console.log('got true');
      return traverse(node.left, arg);
    case false:
      console.log('got false')
      return traverse(node.right, arg);
    default:
      console.log(funcResult);
      return funcResult;
  }
};


let x = 22;

console.log(' ');
console.log(traverse(ruleBook, x)); 
