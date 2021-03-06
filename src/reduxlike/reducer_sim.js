'use strict'

// ****** Reducer for "sim" property of storeType ******

// *** Our imports
import {
    ACTION_SIM_ADVANCE,
    ACTION_SIM_SAVE_CLOCK,
    ACTION_SIM_START,
    ACTION_SIM_STOP,
} from '../const_vals.js';


// *** Sim reducer 
// reducer for "sim" property of app store
// takes:
//  inStoreType: storeType object to use as template for reduction 
//  inActionType: action to use for reduction, as actionType
// returns storeType "sim" property object
export const simReducer = (inStoreType) => (inActionType) =>
    // list of "mini" reducer functions
    // each function is associated with an action type, given in brackets
    ({
        [ACTION_SIM_ADVANCE]: (storeType) => (_) =>
        ({
            ...storeType.sim,
            curTime: storeType.sim.curTime + storeType.sim.timeStep,
        }),

        [ACTION_SIM_SAVE_CLOCK]: (storeType) => (actionType) =>
        ({
            ...storeType.sim,
            savedClock: actionType.clockFloatType,
        }),

        [ACTION_SIM_START]: (storeType) => (_) =>
        ({
            ...storeType.sim,
            running: true,
        }),

        [ACTION_SIM_STOP]: (storeType) => (_) =>
        ({
            ...storeType.sim,
            running: false,
        }),

        // use inActionType.type as an entry key into the key-val list above
        // key is used to select a function that takes a storeType object  
        //  and actionType and returns a storeType "sim" prop obj
        // if no key-val matches the entry key, return a func that echoes 
        //  the given storeType "sim" property object
    }[inActionType.type] || ((storeType) => (_) => ({ ...storeType.sim })))
        // evaluate the function with the storeType "sim" property object 
        //  and actionType to get a storeType "sim" property object
        (inStoreType)
        (inActionType);
