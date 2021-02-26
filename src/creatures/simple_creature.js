'use strict'

// ****** Simple Creature code ******

// *** Imports
// REFACTOR: Can this be refactored away?
import { myStore } from '../index.js';

import { resolveRules } from '../rulebook.js';
import { excludeRange, geThan, sum } from '../util.js';
import { physTypeGetCond, physTypeUseConds, simGetTimeStep } from '../reduxlike/store_getters.js';
import {
    randGen,
    mutableRandGen_seededRand,
    mutableRandGen_seededWeightedRand
} from '../sim/seeded_rand.js';


// *** Behavior functions unique to this creature
// main dispatch function
// if pct behavior is not an object key, 'behavior' bracket search gives null,
//  triggering (x => x), which returns given pct unaltered
// takes physContainerType
// returns physContainerType
export const ActAsSimpleCreature = (pct) =>
    (
        {
            'idling': ActIdling,
            'eating': ActEating,
            'sleeping': ActSleeping,
            'wandering': ActWandering,
        }[physTypeGetCond(pct.physType, 'behavior')] || (x => x)
    )(pct);

// idling behavior function
// takes physContainerType
// returns physContainerType
const ActIdling = (pct) =>
    checkBehavior(
        // pass in physContainerType object with specific glucose, neuro, accel
        physTypeUseConds(pct.physType,
            {
                glucose: physTypeGetCond(pct.physType, 'glucose') - 3.0 * simGetTimeStep(myStore),
                neuro: physTypeGetCond(pct.physType, 'neuro') + 2.0 * simGetTimeStep(myStore),
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
        });

// wandering behavior function
// takes physContainerType
// returns physContainerType
const ActWandering = (pct) =>
    // return evaluation of anonymous function that takes an acceleration and 
    //  heading nudge value...
    (accel => hdg_nudge => checkBehavior(
        // pass in physType object with specific glucose, neuro, heading, accel
        // glucose and neuro impacts are more severe with higher accceleration magnitude
        physTypeUseConds(pct.physType,
            {
                glucose: physTypeGetCond(pct.physType, 'glucose') -
                    (0.3 * Math.abs(accel)) * simGetTimeStep(myStore),
                neuro: physTypeGetCond(pct.physType, 'neuro') +
                    (0.2 * Math.abs(accel)) * simGetTimeStep(myStore),

                heading: physTypeGetCond(pct.physType, 'heading') + hdg_nudge,
                accel: accel,
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
        })
        // ... with random acceleration at least 2.0 in magnitude...
        // ... and random heading nudge (in radians)
    )(excludeRange(mutableRandGen_seededRand(randGen, -4.0, 15.0), 2.0))        // accel
        (mutableRandGen_seededRand(randGen, -0.1, 0.1));                        // heading nudge

// eating behavior function
// takes physContainerType
// returns physContainerType
const ActEating = (pct) =>
    checkBehavior(
        // pass in physType object with specific glucose and neuro
        physTypeUseConds(pct.physType,
            {
                glucose: physTypeGetCond(pct.physType, 'glucose') + 6.0 * simGetTimeStep(myStore),
                neuro: physTypeGetCond(pct.physType, 'neuro') + 4.0 * simGetTimeStep(myStore),
            }),
        // pass in behavior change desires specific to this behavior function
        {
            'eating': () =>
                5.0,
            'idling': (physType) =>
                (physTypeGetCond(physType, 'glucose') > 40.0) ? 5.0 : 0.1
        });

// sleeping behavior function
// takes physContainerType
// returns physContainerType
const ActSleeping = (pct) =>
    checkBehavior(
        // pass in physType object with specific glucose and neuro
        physTypeUseConds(pct.physType,
            {
                glucose: physTypeGetCond(pct.physType, 'glucose') - 1.4 * simGetTimeStep(myStore),
                neuro: physTypeGetCond(pct.physType, 'neuro') - 6.2 * simGetTimeStep(myStore),
            }),
        // pass in behavior change desires specific to this behavior function
        {
            'sleeping': () =>
                5.0,
            'idling': (physType) =>
                (physTypeGetCond(physType, 'neuro') < 60.0) ? 5.0 : 0.1
        });


// *** Code common to all simple creatures
// function to review and return appropriate behavior
// takes physType and desireFuncType
// returns physContainerType
export const checkBehavior = (physType, desireFuncType) =>
    // return physContainerType object with: 
    //  lastRule: the rule node applied to this creature
    //  physType: the creature, as a creatureType with behavior indicated via rulebook review
    //      of randomly-chosen desire based on weighted random draw using desire functions
    resolveRules({
        ...physType,
        conds: {
            ...physType.conds,
            behavior_request:
                Object.keys(desireFuncType)[mutableRandGen_seededWeightedRand(
                    randGen,
                    Object.values(desireFuncType).map(f => f(physType))
                )]
        }
    });
