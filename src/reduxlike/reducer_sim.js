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
//  inStoreTypeSim: store "sim" property object to use as template for reduction 
//  inActionType: action to use for reduction, as actionType
// returns storeType "sim" property object
export const simReducer = (inStoreTypeSim) => (inActionType) =>
    // list of "mini" reducer functions
    // each function is associated with an action type, given in brackets
    ({
        [ACTION_SIM_ADVANCE]: (storeTypeSim) => (_) =>
        ({
            ...storeTypeSim,
            curTime: storeTypeSim.curTime + storeTypeSim.timeStep,
        }),

        [ACTION_SIM_SAVE_CLOCK]: (storeTypeSim) => (actionType) =>
        ({
            ...storeTypeSim,
            savedClock: actionType.clockFloatType,
        }),

        [ACTION_SIM_START]: (storeTypeSim) => (_) =>
        ({
            ...storeTypeSim,
            running: true,

        }),

        [ACTION_SIM_STOP]: (storeTypeSim) => (_) =>
        ({
            ...storeTypeSim,
            running: false,
        }),

        // use inActionType.type as an entry key into the key-val list above
        // key is used to select a function that takes a storeType "sim" property object  
        //  and actionType and returns a storeType
        // if no key-val matches the entry key, return a func that echoes 
        //  the given storeType "sim" property object
    }[inActionType.type] || ((storeTypeSim) => (_) => storeTypeSim))
        // evaluate the function with the storeType "sim" property object 
        //  and actionType to get a storeType "sim" property object
        (inStoreTypeSim)
        (inActionType);
