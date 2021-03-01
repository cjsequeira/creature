'use strict'

// ****** Pseudo-random number generator ******
// THIS IS THE ONLY PART OF THE APPLICATION THAT CONTAINS ITS OWN SEPARATE MUTABLE STATE!

// *** Our imports
import {
    selectWeight,
    sum
} from '../util.js';


// *** Our random number generator state, defined with 0 seed
let randGen = {
    seed: 0
}


// *** Random number utils
// init random number generator
// MUTABLE: Mutates randGen
// takes: numerical seed
// returns the given seed
export function mutableRandGen_initRandGen(initSeed = 0) {
    // MUTABLE: Store given seed in random number generator
    randGen.seed = initSeed;

    return initSeed;
};

// get seeded random number
// MUTABLE: Mutates randGen
// reference: http://indiegamr.com/generate-repeatable-random-numbers-in-js/
// takes:
//  min: minimum bound of random number range
//  max: maximum bound of random number range
// returns number
export function mutableRandGen_seededRand(min = 0.0, max = 1.0) {
    // calculate random value using current seed
    const value = min + ((randGen.seed * 9301 + 49297) % 233280) / 233280 * (max - min);

    // MUTABLE: generate new seed and save in random generator mutable state
    randGen.seed = (randGen.seed * 9301 + 49297) % 233280;

    // return calculated random value
    return value;
};

// using input rand generator and weights list, generate a random number
//  to use for weight selection based on the weights list
// MUTABLE: Mutates randGen
// takes:
//  weightsList: numerical array of weights
// returns number: numerical index into weights list
export const mutableRandGen_seededWeightedRand = (weightsList) =>
    selectWeight
        (weightsList)
        (mutableRandGen_seededRand(0, sum(weightsList)));
