'use strict'

// ****** Functions to get information from store

// *** physType getter functions
// return physType with given conditions
export const physTypeUseConds = (physType, argConds) => ({
    ...physType,
    conds: {
        ...physType.conds,
        ...argConds
    }
});

// return specific condition from physType
export const physTypeGetCond = (physType, argCond) => physType.conds[argCond];

// return key value from physType
export const physTypeGet = (physType, argCond) => physType[argCond];


// *** Simulator getter functions
// return current simulator time
export const simGetCurTime = (store) => store.sim.curTime;

// return last stored system clock time
export const simGetSavedClock = (store) => store.sim.savedClock;

// return simulator running status
export const simGetRunning = (store) => store.sim.running;

// return simulator timestep
export const simGetTimeStep = (store) => store.sim.timeStep;


// *** Get store lock status
export const storeIsLocked = (store) => store.locked;
