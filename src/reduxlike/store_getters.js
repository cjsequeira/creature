'use strict'

// ****** Functions to get information from store

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
export const storeIsLocked = (storeType) => storeType.locked;
