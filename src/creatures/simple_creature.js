'use strict'

// ****** Simple Creature code ******

// *** Imports
import { geThan, seededRand, boundToRange, excludeRange } from '../util.js';
import { physTypeGetCond, physTypeUseConds } from '../reduxlike/store_getters.js';
import { ResolveRules } from '../rulebook.js';


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
                glucose: physTypeGetCond(physType, 'glucose') - 1.0,
                neuro: physTypeGetCond(physType, 'neuro') + 0.5,
                accel: 0.0
            }),
        // pass in behavior change desires specific to this behavior function
        {
            'idling': () =>
                0.2,
            'wandering': (physType) =>
                (physTypeGetCond(physType, 'glucose') < 50.0) ? 4.0 : 0.2,
            'sleeping': (physType) =>
                (physTypeGetCond(physType, 'neuro') > 85.0) ? 4.0 : 0.2,
        }
    );
};

// wandering behavior function
// takes physType
// returns physContainerType
const ActWandering = (physType) => {
    // declare: random acceleration that's at least 0.3 in magnitude
    const rand_a = [
        seededRand(physType.seed, -0.5, 1.8)[0],
        excludeRange(seededRand(physType.seed, -0.5, 1.8)[1], 0.3)
    ];

    // declare: random heading nudge
    const rand_hdg_nudge = seededRand(rand_a[0], -0.6, 0.6);

    return CheckBehavior(
        // pass in physType object with specific glucose, neuro, heading, accel
        // glucose and neuro impacts are more severe with higher accceleration magnitude
        physTypeUseConds(physType,
            {
                glucose: physTypeGetCond(physType, 'glucose') - 1.2 * Math.abs(rand_a[1]),
                neuro: physTypeGetCond(physType, 'neuro') + 1.0 * Math.abs(rand_a[1]),

                heading: physTypeGetCond(physType, 'heading') + rand_hdg_nudge[1],
                accel: rand_a[1],
            }),
        // pass in behavior change desires specific to this behavior function
        {
            'wandering': () =>
                4.0,
            'idling': () =>
                0.2,
            'eating': (physType) =>
                (physTypeGetCond(physType, 'glucose') < 20.0) ? 4.0 : 0.2,
            'sleeping': (physType) =>
                (physTypeGetCond(physType, 'neuro') > 85.0) ? 4.0 : 0.2,
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
                glucose: physTypeGetCond(physType, 'glucose') + 4.0,
                neuro: physTypeGetCond(physType, 'neuro') + 1.0
            }),
        // pass in behavior change desires specific to this behavior function
        {
            'eating': () =>
                1.0,
            'idling': (physType) =>
                (physTypeGetCond(physType, 'glucose') > 40.0) ? 2.0 : 0.2
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
                glucose: physTypeGetCond(physType, 'glucose') - 0.3,
                neuro: physTypeGetCond(physType, 'neuro') - 2.2
            }),
        // pass in behavior change desires specific to this behavior function
        {
            'sleeping': () =>
                1.0,
            'idling': (physType) =>
                (physTypeGetCond(physType, 'neuro') < 60.0) ? 2.0 : 0.2
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
    // note: seededRand returns [seed, value]
    // note: if max_cum_numbers = 0.0, value will be 0.0
    const randInRange = seededRand(physType.seed, 0, max_cum_numbers);

    // declare: first desire "box" that holds random number "target"
    const chosenIndex = cum_numbers.findIndex(x => geThan(randInRange[1])(x));

    // return physContainerType object with: 
    //      lastRule: the rule node applied to this creature
    //      physType: the creature, as a creatureType with:
    //          updated seed
    //          behavior indicated via rulebook review of chosen desire
    return ResolveRules({
        ...physType,
        seed: randInRange[0],
        conds: {
            ...physType.conds,
            behavior_request: Object.keys(desireFuncType)[chosenIndex]
        }
    });
};
