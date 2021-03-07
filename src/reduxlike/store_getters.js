'use strict'

// ****** Functions to get information from store
// REFACTOR: clean up names / order

import { WATCHPROP_CHANGESPROP } from '../const_vals.js';


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

// did given prop in given physType change due to watchProps?
// takes:
//  physType: physType to use
//  propStringType: string name for prop to check - could be a nested prop, with '.'
// returns bool
export const physTypePropChanged = (physType) => (propStringType) =>
    physType[WATCHPROP_CHANGESPROP][propStringType]


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

// *** Get saved physType store
// takes: 
//  storeType: store, as storeType
// returns array of physType objects
export const getSavedPhysTypeStore = (storeType) => storeType.remainder.savedPhysTypeStore;

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
export const getUIProp = (storeType) => (argStringType) => storeType.ui[argStringType];

// *** Get changes array
// takes:
//  storeType: store, as storeType
// returns storeType changes array
export const getChangesArray = (storeType) => storeType.changes;

// *** Get action queue
// takes:
//  storeType: store, as storeType
// returns storeType action queue array
export const getActionQueue = (storeType) => storeType.actionQueue;
