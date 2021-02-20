'use strict'

// ****** Pseudo-random number generator ******
// THIS IS THE ONLY PART OF THE APPLICATION THAT CONTAINS ITS OWN SEPARATE MUTABLE STATE!

// *** Our random number generator state, defined with null seed
export let randGen = {
    seed: null
}


// *** Random number utils
// init random number generator
// MUTABLE: Mutates inRandGen argument
export function mutableRandGen_initRandGen(inRandGen, initSeed = 0) {
    // MUTABLE: Store given seed in random number generator
    inRandGen.seed = initSeed;

    return initSeed;
};

// get seeded random number
// MUTABLE: Mutates inRandGen argument
// reference: http://indiegamr.com/generate-repeatable-random-numbers-in-js/
export function mutableRandGen_seededRand(inRandGen, min = 0.0, max = 1.0) {
    // calculate random value using current seed
    const value = min + ((inRandGen.seed * 9301 + 49297) % 233280) / 233280 * (max - min);

    // MUTABLE: generate new seed and save in in random generator mutable state
    inRandGen.seed = (inRandGen.seed * 9301 + 49297) % 233280;

    // return calculated random value
    return value;
};
