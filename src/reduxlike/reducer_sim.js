'use strict'

// ****** Reducer for "sim" property of storeType ******

// *** Our imports
import {
    getChangesList,
    getPhysTypeStore,
    getPhysTypeCond,
    getSimCurTime,
    getSimRunning,
    getSimTimeStep,
    getPhysTypeAct,
    getSimSeed
} from './store_getters.js';

import {
    ACTION_COMPARE_STOP_IF_FROZEN,
    ACTION_FORCE_CHANGES_LIST_UPDATE,
    ACTION_PHYSTYPE_UPDATE_SELECT_PHYSTYPES_RAND,
    ACTION_SIM_ADVANCE,
    ACTION_SIM_INC_SEED,
    ACTION_SIM_SAVE_CLOCK,
    ACTION_SIM_SET_SEED,
    ACTION_SIM_START,
    ACTION_SIM_STOP,
} from '../const_vals.js';

import { actAsSimpleCreature } from '../phystypes/simple_creature.js';
import { rand_getNextSeed } from '../sim/seeded_rand.js';


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
                // are ALL simple creatures frozen?
                (
                    getPhysTypeStore(storeType)
                        // filter physType store to find simple creatures
                        .filter((ptToTest1) => getPhysTypeAct(ptToTest1) === actAsSimpleCreature)

                        // filter to find those with behavior of 'frozen'
                        .filter((ptToTest2) => getPhysTypeCond(ptToTest2)('behavior') === 'frozen')

                        // is number of frozen simple creatures equal to 
                        //  total number of simple creatures?
                        .length ===

                    getPhysTypeStore(storeType)
                        // filter physType store to find simple creatures
                        .filter((ptToTest1) => getPhysTypeAct(ptToTest1) === actAsSimpleCreature)

                        // total number of simple creatures
                        .length
                )
                    // yes: set "running" to false
                    ? false

                    // no: leave "running" unchanged
                    : getSimRunning(storeType),
        }),

        [ACTION_FORCE_CHANGES_LIST_UPDATE]: (storeType) => (actionType) =>
        ({
            ...storeType.sim,

            changesList:
                // is the target substore this one?
                (actionType.subStringType === 'sim')
                    // yes: add the given object name to the changes list
                    ? [
                        ...getChangesList(storeType)('sim'),
                        actionType.objStringType,
                    ]

                    // no: keep the changes list the same
                    : getChangesList(storeType)('sim'),
        }),

        [ACTION_PHYSTYPE_UPDATE_SELECT_PHYSTYPES_RAND]: (storeType) => (actionType) =>
        ({
            ...storeType.sim,

            seed:
                // does the physType store have physTypes in it?
                (getPhysTypeStore(storeType).length > 0)
                    // yes: get to the next seed by counting randM generators
                    ? getPhysTypeStore(storeType).reduce((accumSeed, thisPt) =>
                        // does this physType pass the filter function?
                        (actionType.filterFunc(thisPt))
                            // yes: advance the seed by the number of randM generators 
                            //  in this physType, minus 1
                            ? rand_getNextSeed(accumSeed)(actionType.gensForRand.length - 1)

                            // no: don't go to the next seed
                            : accumSeed

                        // start with the current sim seed
                        , getSimSeed(storeType))
                    // no: keep the seed the same
                    : getSimSeed(storeType)
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
            seed:
                (actionType.seedIncIntType > 0)
                    ? rand_getNextSeed(getSimSeed(storeType))(actionType.seedIncIntType - 1)
                    : getSimSeed(storeType)
        }),

        [ACTION_SIM_SAVE_CLOCK]: (storeType) => (_) =>
        ({
            ...storeType.sim,
            savedClock: getSimCurTime(storeType),
        }),

        [ACTION_SIM_SET_SEED]: (storeType) => (actionType) =>
        ({
            ...storeType.sim,
            seed: actionType.seedIntType,
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
