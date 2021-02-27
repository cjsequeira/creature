'use strict'

// ****** Functions to get information from store

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
export const physTypeGetCond = (physType, argCond) => physType.conds[argCond];

// return key value from physType
// takes:
//  physType: physType to use
//  arg: string name for key of physType to look at
// returns key value
export const physTypeGet = (physType, arg) => physType[arg];


// *** Simulator getter functions
// return current simulator time
// takes: store, as storeType
// returns number
export const simGetCurTime = (store) => store.sim.curTime;

// return last stored system clock time
// takes: store, as storeType
// returns number
export const simGetSavedClock = (store) => store.sim.savedClock;

// return simulator running status
// takes: store, as storeType
// returns bool
export const simGetRunning = (store) => store.sim.running;

// return simulator timestep
// takes: store, as storeType
// returns number
export const simGetTimeStep = (store) => store.sim.timeStep;


// *** Get store lock status
// takes: store, as storeType
// returns bool
export const storeIsLocked = (store) => store.locked;
