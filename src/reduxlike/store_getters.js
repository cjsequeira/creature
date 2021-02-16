'use strict'

// ****** Functions to get information from store

// *** physicalContainerType getter functions
// return physicalContainerType with given conditions
export const pctUseConds = (pct, argConds) => ({
    ...pct,
    physicalElem: {
        ...pct.physicalElem,
        conds: {
            ...pct.physicalElem.conds,
            ...argConds
        }
    }
});

// return specific condition from physicalContainerType
export const pctGetCond = (pct, argCond) => pct.physicalElem.conds[argCond];


// *** Simulator getter functions
// return current simulator time
export const simGetCurTime = (store) => store.sim.curTime;

// return simulator running status
export const simGetRunning = (store) => store.sim.running;