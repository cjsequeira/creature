'use strict'

// ****** Simple Creature code ******

// *** Imports
import { geThan, seededRand } from '../util.js';
import { ResolveRules } from '../rulebook.js';


// *** Behavior functions unique to this creature
// main dispatch function
// returns { lastRule: last used rule node, physicalElem: physicalType with rule applied }
export const ActAsSimpleCreature = (creatureType) => {
    switch (creatureType.conds.behavior) {
        case 'idling': return ActIdling(creatureType)
        case 'eating': return ActEating(creatureType)
        case 'sleeping': return ActSleeping(creatureType)
        case 'wandering': return ActWandering(creatureType)
        default: return { lastRule: null, physicalElem: creatureType}
    }
};

// idling behavior function
// returns { lastRule: last used rule node, physicalElem: physicalType with rule applied }
const ActIdling = (creatureType) => {
    return CheckBehavior(
        // pass in creatureType object with specific glucose, neuro, and random velocity
        {
            ...creatureType,
            conds: {
                ...creatureType.conds,
                glucose: creatureType.conds.glucose - 1.0,
                neuro: creatureType.conds.neuro + 0.5,
            }
        },
        // pass in behavior change desires specific to this behavior function
        {
            'idling': () => 0.2,
            'wandering': (creatureType) => (creatureType.conds.glucose < 40.0) ? 4.0 : 0.2,
            'sleeping': (creatureType) => (creatureType.conds.neuro > 85.0) ? 4.0 : 0.2,
        }
    );
};

// wandering behavior function
// returns { lastRule: last used rule node, physicalElem: physicalType with rule applied }
const ActWandering = (creatureType) => {
    // declare: random acceleration
    const rand_a = seededRand(creatureType.seed, -2.0, 2.0);

    // declare: random heading nudge
    const rand_hdg_nudge = seededRand(rand_a[0], -0.3, 0.3);

    return CheckBehavior(
        // pass in creatureType object with specific glucose, neuro, and random acceleration
        {
            ...creatureType,
            seed: rand_hdg_nudge[0],
            conds: {
                ...creatureType.conds,
                glucose: creatureType.conds.glucose - 1.6,
                neuro: creatureType.conds.neuro + 1.6,
                
                heading: creatureType.conds.heading + rand_hdg_nudge[1],
                accel: rand_a[1],
            }
        },
        // pass in behavior change desires specific to this behavior function
        {
            'wandering': () => 4.0,
            'idling': () => 0.2,
            'eating': (creatureType) => (creatureType.conds.glucose < 20.0) ? 4.0 : 0.2,
            'sleeping': (creatureType) => (creatureType.conds.neuro > 85.0) ? 4.0 : 0.2,
        }
    );
};

// eating behavior function
// returns { lastRule: last used rule node, physicalElem: physicalType with rule applied }
const ActEating = (creatureType) =>
    CheckBehavior(
        // pass in creatureType object with specific glucose and neuro
        {
            ...creatureType,
            conds: {
                ...creatureType.conds,
                glucose: creatureType.conds.glucose + 4.0,
                neuro: creatureType.conds.neuro + 1.0,
            }
        },
        // pass in behavior change desires specific to this behavior function
        {
            'eating': () => 1.0,
            'idling': (creatureType) => (creatureType.conds.glucose > 50.0) ? 2.0 : 0.2
        }
    );

// sleeping behavior function
// returns { lastRule: last used rule node, physicalElem: physicalType with rule applied }
const ActSleeping = (creatureType) =>
    CheckBehavior(
        // pass in creatureType object with specific glucose and neuro
        {
            ...creatureType,
            conds: {
                ...creatureType.conds,
                glucose: creatureType.conds.glucose - 0.3,
                neuro: creatureType.conds.neuro - 2.2,
            }
        },
        // pass in behavior change desires specific to this behavior function
        {
            'sleeping': () => 1.0,
            'idling': (creatureType) => (creatureType.conds.neuro < 50.0) ? 2.0 : 0.2
        }
    );


// *** Code common to all simple creatures
// function to review and return appropriate behavior
// returns { lastRule: last used rule node, physicalElem: physicalType with rule applied }
export const CheckBehavior = (creatureType, desireFuncType) => {
    // declare: numerical desires as evaluation of each desire func with nifty shorthand
    const numbers = Object.values(desireFuncType).map(f => f(creatureType));

    // declare: desires as cumulative array
    const cum_numbers = numbers.reduce((a, x, i) => [...a, x + (a[i - 1] || 0)], []);

    // declare: max value in cumulative array
    const max_cum_numbers = cum_numbers.reduce((a, x) => Math.max(a, x));

    // declare: random number in range of max value, as [0, max_cum_numbers]
    // note: seededRand returns [seed, value]
    // note: if max_cum_numbers = 0.0, value will be 0.0
    const randInRange = seededRand(creatureType.seed, 0, max_cum_numbers);

    // declare: first desire "box" that holds random number "target"
    const chosenIndex = cum_numbers.findIndex(x => geThan(randInRange[1])(x));

    // return physicalStoreType object with: 
    //      lastRule: the rule node applied to this creature
    //      physicalElem: the creature, as a creatureType with:
    //          updated seed
    //          behavior indicated via rulebook review of chosen desire
    return ResolveRules({
        ...creatureType,
        seed: randInRange[0],
        conds: {
            ...creatureType.conds,
            behavior_request: Object.keys(desireFuncType)[chosenIndex]
        }
    });
};