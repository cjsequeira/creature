'use strict'

// ****** Functions to get information from store
// REFACTOR: clean up names / order throughout app!!!

import { WATCHPROP_CHANGESPROP } from '../const_vals.js';
import { watchProps } from './watch_props.js';


// *** physType getter functions
// return physType with given conditions
// takes:
//  physType: physType to use
//  argConds: list of conditions to include, as ...{key, value}
// returns physType
export const physTypeUseConds = (physType) => (argConds) => ({
    ...physType,
    conds: {
        ...physType.conds,
        ...argConds
    }
});

// return specific condition from physType
// takes:
//  physType: physType to use
//  argCond: string name for key of condition to look at
// returns condition value
export const physTypeGetCond = (physType) => (argCond) => physType.conds[argCond];

// return key value from physType
// takes:
//  physType: physType to use
//  argStringType: string name for key of physType to look at
// returns key value
export const physTypeGet = (physType) => (argStringType) => physType[argStringType];

// did given prop in given physType change?
// takes:
//  physType: physType to use
//  propStringType: string name for prop to check - could be a nested prop, with '.'
// returns bool
export const physTypePropChanged = (beforePhysType) => (afterPhysType) => (propStringType) =>
    (
        watchProps                          // get obj with watchprops added
            (beforePhysType)
            (afterPhysType)
            (propStringType)
        [WATCHPROP_CHANGESPROP]             // select watchprops sub-object
        [propStringType]                    // select specific watchprop
    ) || false;                             // if watchprop is undefined, return 'false'

    
// *** Simulator getter functions
// return current simulator time
// takes: 
//  storeType: store, as storeType
// returns number
export const simGetCurTime = (storeType) => storeType.sim.curTime;

// return last stored system clock time
// takes: 
//  storeType: store, as storeType
// returns number
export const simGetSavedClock = (storeType) => storeType.sim.savedClock;

// return simulator running status
// takes: 
//  storeType: store, as storeType
// returns bool
export const simGetRunning = (storeType) => storeType.sim.running;

// return simulator timestep
// takes: 
//  storeType: store, as storeType
// returns number
export const simGetTimeStep = (storeType) => storeType.sim.timeStep;


// *** Get store lock status
// takes: 
//  storeType: store, as storeType
// returns bool
export const storeIsLocked = (storeType) => storeType.remainder.locked;

// *** Get physType store
// takes: 
//  storeType: store, as storeType
// returns array of physType objects
export const getPhysTypeStore = (storeType) => storeType.remainder.physTypeStore;

// get specific physType in store at given index
// takes:
//  storeType: store, as storeType
//  indexIntType: index into physType store
// returns physType
export const getPhysTypeAtIndex = (storeType) => (indexIntType) =>
    storeType.remainder.physTypeStore[indexIntType];

// get specific condition of specific physType in store at given index
// takes:
//  storeType: store, as storeType
//  indexIntType: index into physType store
//  condStringType: specific condition to get, as string
// returns any
export const getPhysTypeCondAtIndex = (storeType) => (indexIntType) => (condStringType) =>
    storeType.remainder.physTypeStore[indexIntType][condStringType];

// *** Get saved physType store
// takes: 
//  storeType: store, as storeType
// returns array of physType objects
export const getSavedPhysTypeStore = (storeType) => storeType.remainder.savedPhysTypeStore;


// *** Get "passed comparison" physType store
// takes: 
//  storeType: store, as storeType
// returns array of physType objects
export const getPassedComparePhysTypeStore = (storeType) => storeType.remainder.passedComparePhysTypeStore;


// *** Get journal
// takes: 
//  storeType: store, as storeType
// returns journalType
export const getJournal = (storeType) => storeType.remainder.journal;

// *** Get UI property val
// takes:
//  storeType: store, as storeType
//  propStringType: string name for prop of store UI object to look at
// returns value, as any
export const getUIProp = (storeType) => (argStringType) => storeType.remainder[argStringType];
