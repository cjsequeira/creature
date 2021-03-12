'use strict'

// ****** Functions to get information from store and generate store info

import { WATCHPROP_CHANGESPROP } from '../const_vals.js';
import { watchProps } from './watch_props.js';


// *** physType info gen functions
// generate available ID based on IDs already in use
// takes: 
//  storeType
//  proposedIDIntType: initial ID to check for availability, as int
// returns int
export const genPhysTypeAvailID = (storeType) => (proposedIDIntType) =>
    // is there a physType that already has the given ID?
    (getPhysTypeStore(storeType)
        .filter((ptToTest) => getPhysTypeRootKey(ptToTest)('id') === proposedIDIntType)
        .length > 0)
        // yes: increment the ID by one and check that
        ? genPhysTypeAvailID(storeType)(proposedIDIntType + 1)

        // no: send the given ID back to be used
        : proposedIDIntType


// *** physType getter functions
// did given prop in given physType change?
// takes:
//  physType: physType to use
//  propStringType: string name for prop to check - could be a nested prop, with '.'
// returns bool
export const didPhysTypePropChange = (beforePhysType) => (afterPhysType) => (propStringType) =>
    (
        watchProps                          // get obj with watchprops added
            (beforePhysType)
            (afterPhysType)
            (propStringType)
        [WATCHPROP_CHANGESPROP]             // select watchprops sub-object
        [propStringType]                    // select specific watchprop
    ) || false;                             // if watchprop is undefined, return 'false'

// get "passed comparison" physType store
// takes: 
//  storeType: store, as storeType
// returns array of physType objects
export const getPassedComparePhysTypeStore = (storeType) => storeType.remainder.passedComparePhysTypeStore;

// get specific condition from physType
// takes:
//  physType: physType to use
//  argCond: string name for key of condition to look at
// returns condition value
export const getPhysTypeCond = (physType) => (argCond) => physType.conds[argCond];

// get key value from physType
// takes:
//  physType: physType to use
//  argStringType: string name for key of physType to look at
// returns key value
export const getPhysTypeRootKey = (physType) => (argStringType) => physType[argStringType];

// get physType store
// takes: 
//  storeType: store, as storeType
// returns array of physType objects
export const getPhysTypeStore = (storeType) => storeType.physTypeStore;

// get saved physType store
// takes: 
//  storeType: store, as storeType
// returns array of physType objects
export const getSavedPhysTypeStore = (storeType) => storeType.remainder.savedPhysTypeStore;


// *** physType "use" functions
// use given conditions to make a physType
// takes:
//  physType: physType to use
//  argConds: list of conditions to include, as ...{key, value}
// returns physType
export const usePhysTypeConds = (physType) => (argConds) => ({
    ...physType,
    conds: {
        ...physType.conds,
        ...argConds
    }
});


// *** Simulator getter functions
// return current simulator time
// takes: 
//  storeType: store, as storeType
// returns number
export const getSimCurTime = (storeType) => storeType.sim.curTime;

// return simulator running status
// takes: 
//  storeType: store, as storeType
// returns bool
export const getSimRunning = (storeType) => storeType.sim.running;

// return last stored system clock time
// takes: 
//  storeType: store, as storeType
// returns number
export const getSimSavedClock = (storeType) => storeType.sim.savedClock;

// return simulator timestep
// takes: 
//  storeType: store, as storeType
// returns number
export const getSimTimeStep = (storeType) => storeType.sim.timeStep;


// *** Unsorted getters
// get journal
// takes: 
//  storeType: store, as storeType
// returns journalType
export const getJournal = (storeType) => storeType.remainder.journal;

// get UI property val
// takes:
//  storeType: store, as storeType
//  propStringType: string name for prop of store UI object to look at
// returns value, as any
export const getUIProp = (storeType) => (argStringType) => storeType.remainder[argStringType];
