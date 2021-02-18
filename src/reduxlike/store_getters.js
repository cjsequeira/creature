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


// *** Simulator getter functions
// return current simulator time
export const simGetCurTime = (store) => store.sim.curTime;

// return simulator running status
export const simGetRunning = (store) => store.sim.running;