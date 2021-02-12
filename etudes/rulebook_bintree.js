'use strict'

// ****** Code to test implementation of a rulebook as a binary tree
// Inspired by: https://ericlippert.com/2015/05/11/wizards-and-warriors-part-five/
//
// Concept:
//
// The rulebook is an implementation of test functions and final "instructions." The test
// functions are interior nodes, and the final "instructions" are the leaf nodes. The 
// rulebook consists entirely of nodes, of the format:
//
// {
//      func: mandatory function that always returns a bool or non-bool value
//      left: node to traverse if func evaluates to true
//      right: node to traverse if func evaluates to false
// }  
//
//  left and right are optional in the node IF AND ONLY IF func will NEVER evaluate to a bool.
//
//  The tree is traversed by evaluating each function recursively, going left if true, going right
//  if false, and returning the function result if non-bool.

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
