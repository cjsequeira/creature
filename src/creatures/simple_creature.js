'use strict'

// ****** Simple Creature code ******

// *** Imports
// REFACTOR: Can this be refactored away?
import { myStore } from '../index.js';

import { resolveRules } from '../rulebook.js';
import { excludeRange } from '../util.js';
import {
    physTypeGetCond,
    physTypeUseConds,
    simGetTimeStep
} from '../reduxlike/store_getters.js';
import {
    mutableRandGen_seededRand,
    mutableRandGen_seededWeightedRand
} from '../sim/seeded_rand.js';


// *** Default Simple Creature assembler
// takes: nothing
// returns physType
export const getDefaultSimpleCreature = () => ({
    name: 'New Simple Creature',
    color: '#00bb00ff',
    act: actAsSimpleCreature,
    conds: {
        // internal biology
        glucose: 50.0,
        neuro: 50.0,

        // behavior
        behavior: 'idling',
        behavior_request: null,

        // location
        x: 10.0,
        y: 10.0,

        // heading, speed, acceleration
        heading: 0.0 * Math.PI / 180.0,
        speed: 2.0,
        accel: 0.0,
    },
});


// *** Behavior functions unique to this creature
// main dispatch function
// this function works by using the physType behavior to select a function to apply
// if behavior is not a key in the object, 'behavior' bracket search gives null,
//  causing return of identity function (x => x), which returns given physType unaltered
// takes: physType
// returns physType
export const actAsSimpleCreature = (physType) =>
    (
        {
            'idling': actIdling,
            'eating': actEating,
            'sleeping': actSleeping,
            'wandering': actWandering,
        }[physTypeGetCond(physType)('behavior')] || (x => x)
    )(physType);

// idling behavior function
// takes: physType
// returns physType
const actIdling = (physType) =>
    doBehavior(
        // pass in physType object with specific glucose, neuro, accel
        physTypeUseConds
            (physType)
            ({
                glucose: physTypeGetCond(physType)('glucose') - 3.0 * simGetTimeStep(myStore),
                neuro: physTypeGetCond(physType)('neuro') + 2.0 * simGetTimeStep(myStore),
                accel: 0.0
            }),
        // pass in behavior change desires specific to this behavior function
        {
            'idling': () =>
                4.0,
            'wandering': (physType) =>
                (physTypeGetCond(physType)('glucose') < 50.0) ? 7.0 : 0.1,
            'sleeping': (physType) =>
                (physTypeGetCond(physType)('neuro') > 85.0) ? 4.0 : 0.1,
        });

// wandering behavior function
// takes: physType
// returns physType
const actWandering = (physType) =>
    // return evaluation of anonymous function that takes an acceleration  
    //  and heading nudge value
    (
        (accel) => (hdg_nudge) => doBehavior(
            // pass in physType object with specific glucose, neuro, heading, accel
            // glucose and neuro impacts are more severe with higher accceleration magnitude
            physTypeUseConds
                (physType)
                ({
                    glucose: physTypeGetCond(physType)('glucose') -
                        (0.3 * Math.abs(accel)) * simGetTimeStep(myStore),
                    neuro: physTypeGetCond(physType)('neuro') +
                        (0.2 * Math.abs(accel)) * simGetTimeStep(myStore),

                    heading: physTypeGetCond(physType)('heading') + hdg_nudge,
                    accel: accel,
                }),
            // pass in behavior change desires specific to this behavior function
            {
                'wandering': () =>
                    7.0,
                'idling': () =>
                    0.1,
                'eating': (physType) =>
                    (physTypeGetCond(physType)('glucose') < 20.0) ? 7.0 : 0.1,
                'sleeping': (physType) =>
                    (physTypeGetCond(physType)('neuro') > 85.0) ? 7.0 : 0.1,
            })
    )
        // anonymous function arguments:
        //  random acceleration at least 2.0 in magnitude...
        //  random heading nudge (in radians)
        (excludeRange(2.0)(mutableRandGen_seededRand(-4.0, 15.0)))      // accel
        (mutableRandGen_seededRand(-0.1, 0.1));                         // heading nudge

// eating behavior function
// takes physType
// returns physType
const actEating = (physType) =>
    doBehavior(
        // pass in physType object with specific glucose and neuro
        physTypeUseConds
            (physType)
            ({
                glucose: physTypeGetCond(physType)('glucose') + 6.0 * simGetTimeStep(myStore),
                neuro: physTypeGetCond(physType)('neuro') + 4.0 * simGetTimeStep(myStore),
            }),
        // pass in behavior change desires specific to this behavior function
        {
            'eating': () =>
                5.0,
            'idling': (physType) =>
                (physTypeGetCond(physType)('glucose') > 40.0) ? 5.0 : 0.1
        });

// sleeping behavior function
// takes physType
// returns physType
const actSleeping = (physType) =>
    doBehavior(
        // pass in physType object with specific glucose and neuro
        physTypeUseConds
            (physType)
            ({
                glucose: physTypeGetCond(physType)('glucose') - 1.4 * simGetTimeStep(myStore),
                neuro: physTypeGetCond(physType)('neuro') - 6.2 * simGetTimeStep(myStore),
            }),
        // pass in behavior change desires specific to this behavior function
        {
            'sleeping': () =>
                5.0,
            'idling': (physType) =>
                (physTypeGetCond(physType)('neuro') < 60.0) ? 5.0 : 0.1
        });


// *** Code common to all simple creatures
// function to review and return appropriate behavior
// takes physType and desireFuncType
// returns physType
export const doBehavior = (physType, desireFuncType) =>
    // return physType object that is the creature, as a creatureType 
    //  with behavior indicated via rulebook review of randomly-chosen desire 
    //  based on weighted random draw using given desire functions
    resolveRules(physTypeUseConds
        (physType)
        ({
            behavior_request:
                // select behavior request from list of desire funcs using 
                // a weighted random number selector
                Object.keys(desireFuncType)[mutableRandGen_seededWeightedRand(
                    // numerical list of desires, used as weights for random draw
                    Object.values(desireFuncType).map(f => f(physType))
                )]
        })
    );
