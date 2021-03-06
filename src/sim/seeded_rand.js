'use strict'

// ****** Pseudo-random number generator ******
// THIS IS THE ONLY PART OF THE APPLICATION THAT CONTAINS ITS OWN SEPARATE MUTABLE STATE!

// *** Our imports
import {
    selectWeight,
    sum,
} from '../utils.js';


// *** Our random number generator state, defined with 0 seed
let randGen = {
    seed: 0
}


// *** Random number utils
// init random number generator
// MUTABLE: Mutates randGen
// takes: 
//  initSeedIntType: numerical seed, as int
// returns the given seed
export function mutableRandGen_initRandGen(initSeedIntType = 0) {
    // MUTABLE: Store given seed in random number generator
    randGen.seed = initSeedIntType;

    return initSeedIntType;
};

// get seeded random number
// MUTABLE: Mutates randGen
// reference: http://indiegamr.com/generate-repeatable-random-numbers-in-js/
// takes:
//  minFloatType: minimum bound of random number range, as float
//  maxFloatType: maximum bound of random number range, as float
// returns number, as float
export function mutableRandGen_seededRand(minFloatType = 0.0, maxFloatType = 1.0) {
    // calculate random value using current seed
    const value = minFloatType +
        ((randGen.seed * 9301 + 49297) % 233280) /
        233280 * (maxFloatType - minFloatType);

    // MUTABLE: generate new seed and save in random generator mutable state
    randGen.seed = (randGen.seed * 9301 + 49297) % 233280;

    // return calculated random value
    return value;
};

// using input rand generator and weights list, generate a random number
//  to use for weight selection based on the weights list
// MUTABLE: Mutates randGen
// takes:
//  weightsFloatType: array of weights, as float
// returns number: numerical index into weights list, as int
export const mutableRandGen_seededWeightedRand = (weightsFloatType) =>
    selectWeight
        (weightsFloatType)
        (mutableRandGen_seededRand(0, sum(weightsFloatType)));
