'use strict'

// ****** Reducer for "sim" property of storeType ******

// *** Our imports
import {
    ACTION_COMPARE_STOP_IF_FROZEN,
    ACTION_SIM_ADVANCE,
    ACTION_SIM_INC_SEED,
    ACTION_SIM_SAVE_CLOCK,
    ACTION_SIM_START,
    ACTION_SIM_STOP,
} from '../const_vals.js';

import { actAsSimpleCreature } from '../phystypes/simple_creature.js';

import {
    getPhysTypeStore,
    getPhysTypeCond,
    getSimCurTime,
    getSimRunning,
    getSimTimeStep,
    getPhysTypeAct
} from './store_getters.js';


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
        [ACTION_COMPARE_STOP_IF_FROZEN]: (storeType) => (_) =>
        ({
            ...storeType.sim,
            running:
                // do we have more than zero frozen simple creatures?
                (
                    getPhysTypeStore(storeType)
                        // filter physType store to find simple creatures
                        .filter((ptToTest1) => getPhysTypeAct(ptToTest1) === actAsSimpleCreature)

                        // filter to find those with behavior of 'frozen'
                        .filter((ptToTest2) => getPhysTypeCond(ptToTest2)('behavior') === 'frozen')

                        // do we have more than zero frozen simple creatures?
                        .length > 0
                )
                    // yes: set "running" to false
                    ? false

                    // no: leave "running" unchanged
                    : getSimRunning(storeType),
        }),

        [ACTION_SIM_ADVANCE]: (storeType) => (_) =>
        ({
            ...storeType.sim,
            curTime:
                // is sim running?
                (getSimRunning(storeType))
                    // yes: advance the time using the timestep
                    ? getSimCurTime(storeType) + getSimTimeStep(storeType)

                    // no: keep the time the same as it currently is
                    : getSimCurTime(storeType),
        }),

        [ACTION_SIM_INC_SEED]: (storeType) => (actionType) =>
        ({
            ...storeType.sim,
            seed: storeType.sim.seed + actionType.seedIncIntType,
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
