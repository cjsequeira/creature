'use strict'

// ****** Simple Creature code ******

// *** Imports
import { myStore } from '../index.js';

import { resolveRules } from '../rulebook.js';
import { geThan, boundToRange, excludeRange } from '../util.js';
import { physTypeGetCond, physTypeUseConds, simGetTimeStep } from '../reduxlike/store_getters.js';
import { randGen, mutableRandGen_seededRand } from '../sim/seeded_rand.js';


// *** Behavior functions unique to this creature
// main dispatch function
// takes physContainerType
// returns physContainerType
export const ActAsSimpleCreature = (pct) => {
    switch (pct.physType.conds.behavior) {
        case 'idling': return ActIdling(pct.physType)
        case 'eating': return ActEating(pct.physType)
        case 'sleeping': return ActSleeping(pct.physType)
        case 'wandering': return ActWandering(pct.physType)
        default: return pct
    }
};

// idling behavior function
// takes physType
// returns physContainerType
const ActIdling = (physType) => {
    return CheckBehavior(
        // pass in physType object with specific glucose, and neuro
        physTypeUseConds(physType,
            {
                glucose: physTypeGetCond(physType, 'glucose') - 3.0 * simGetTimeStep(myStore),
                neuro: physTypeGetCond(physType, 'neuro') + 2.0 * simGetTimeStep(myStore),
                accel: 0.0
            }),
        // pass in behavior change desires specific to this behavior function
        {
            'idling': () =>
                4.0,
            'wandering': (physType) =>
                (physTypeGetCond(physType, 'glucose') < 50.0) ? 7.0 : 0.1,
            'sleeping': (physType) =>
                (physTypeGetCond(physType, 'neuro') > 85.0) ? 4.0 : 0.1,
        }
    );
};

// wandering behavior function
// takes physType
// returns physContainerType
const ActWandering = (physType) => {
    // declare: random acceleration that's at least 2.0 in magnitude
    const rand_a = excludeRange(mutableRandGen_seededRand(randGen, -4.0, 15.0), 2.0);

    // declare: random heading nudge
    const rand_hdg_nudge = mutableRandGen_seededRand(randGen, -0.1, 0.1);

    return CheckBehavior(
        // pass in physType object with specific glucose, neuro, heading, accel
        // glucose and neuro impacts are more severe with higher accceleration magnitude
        physTypeUseConds(physType,
            {
                glucose: physTypeGetCond(physType, 'glucose') -
                    (0.3 * Math.abs(rand_a)) * simGetTimeStep(myStore),
                neuro: physTypeGetCond(physType, 'neuro') +
                    (0.2 * Math.abs(rand_a)) * simGetTimeStep(myStore),

                heading: physTypeGetCond(physType, 'heading') + rand_hdg_nudge,
                accel: rand_a,
            }),
        // pass in behavior change desires specific to this behavior function
        {
            'wandering': () =>
                7.0,
            'idling': () =>
                0.1,
            'eating': (physType) =>
                (physTypeGetCond(physType, 'glucose') < 20.0) ? 7.0 : 0.1,
            'sleeping': (physType) =>
                (physTypeGetCond(physType, 'neuro') > 85.0) ? 7.0 : 0.1,
        }
    );
};

// eating behavior function
// takes physType
// returns physContainerType
const ActEating = (physType) =>
    CheckBehavior(
        // pass in physType object with specific glucose and neuro
        physTypeUseConds(physType,
            {
                glucose: physTypeGetCond(physType, 'glucose') + 10.0 * simGetTimeStep(myStore),
                neuro: physTypeGetCond(physType, 'neuro') + 5.0 * simGetTimeStep(myStore),
            }),
        // pass in behavior change desires specific to this behavior function
        {
            'eating': () =>
                5.0,
            'idling': (physType) =>
                (physTypeGetCond(physType, 'glucose') > 40.0) ? 5.0 : 0.1
        }
    );

// sleeping behavior function
// takes physType
// returns physContainerType
const ActSleeping = (physType) =>
    CheckBehavior(
        // pass in physType object with specific glucose and neuro
        physTypeUseConds(physType,
            {
                glucose: physTypeGetCond(physType, 'glucose') - 3.0 * simGetTimeStep(myStore),
                neuro: physTypeGetCond(physType, 'neuro') - 10.2 * simGetTimeStep(myStore),
            }),
        // pass in behavior change desires specific to this behavior function
        {
            'sleeping': () =>
                5.0,
            'idling': (physType) =>
                (physTypeGetCond(physType, 'neuro') < 60.0) ? 5.0 : 0.1
        }
    );


// *** Code common to all simple creatures
// function to review and return appropriate behavior
// takes physType and desireFuncType
// returns physContainerType
export const CheckBehavior = (physType, desireFuncType) => {
    // declare: numerical desires as evaluation of each desire func with nifty shorthand
    const numbers = Object.values(desireFuncType).map(f => f(physType));

    // declare: numerical desires as cumulative array
    const cum_numbers = numbers.reduce((a, x, i) => [...a, x + (a[i - 1] || 0)], []);

    // declare: max value in cumulative array
    const max_cum_numbers = cum_numbers.reduce((a, x) => Math.max(a, x));

    // declare: random number in range of max value, as [0, max_cum_numbers]
    // note: if max_cum_numbers = 0.0, value will be 0.0
    const randInRange = mutableRandGen_seededRand(randGen, 0, max_cum_numbers);

    // declare: first desire "box" that holds random number "target"
    const chosenIndex = cum_numbers.findIndex(x => geThan(randInRange)(x));

    // return physContainerType object with: 
    //  lastRule: the rule node applied to this creature
    //  physType: the creature, as a creatureType with behavior indicated via rulebook review of chosen desire
    return resolveRules({
        ...physType,
        conds: {
            ...physType.conds,
            behavior_request: Object.keys(desireFuncType)[chosenIndex]
        }
    });
};
