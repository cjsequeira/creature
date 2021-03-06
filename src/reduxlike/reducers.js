'use strict'

// ****** Functions to produce store based on given store and action, and render store changes

// *** Our imports
import {
    ACTION_CLEAR_ACTION_QUEUE,
    ACTION_DO_NOTHING,
    ACTION_JOURNAL_ADD_ENTRY,
    ACTION_MUTABLE_RENDER,
    ACTION_PHYSTYPE_DO_ACT,
    ACTION_QUEUE_ADD_GEO_CHART_DATA,
    ACTION_QUEUE_ADD_STATUS_MESSAGE,
    ACTION_QUEUE_ADD_TIME_CHART_DATA,
    ACTION_SIM_ADVANCE,
    ACTION_SIM_SAVE_CLOCK,
    ACTION_SIM_START,
    ACTION_SIM_STOP,
    ACTION_STORE_LOCK,
    ACTION_STORE_UNLOCK,
    ACTION_WATCH_QUEUE_COMPARE_SAVED,
    ACTION_WATCH_SAVE_PHYSTYPE,
} from '../const_vals.js';

import { simGetCurTime } from './store_getters.js';

import {
    roundTo,
    splice
} from '../utils.js';

import {
    mutable_renderStoreChanges,
    mutable_updateGeoChartData,
    mutable_updateStatusBox,
    mutable_updateTimeChartData,
} from './renderers.js';

import { watchProps } from './watch_props.js';


// *** Sim reducer 
// reducer for "sim" property of app store
// takes:
//  inStoreType: store to use as template for reduction, as storeType 
//  ...inActionTypes: array of actions to use sequentially for reduction, as actionType
// returns storeType
export const simReducer = (inStoreType) => (...inActionTypes) =>
    // apply each of the actions to the input store in sequential order
    inActionTypes.flat(Infinity).reduce((accumStoreType, curActionType) =>
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

            // use curActionType.type as an entry key into the key-val list above
            // key is used to select a function that takes a storeType and actionType 
            //  and returns a storeType
            // if no key-val matches the entry key, return a func that echoes the given storeType
        }[curActionType.type] || ((storeType) => (_) => storeType))
            // evaluate the function with the storeType accumulator and current action to get a storeType
            (accumStoreType || inStoreType)
            (curActionType),

        // we start our reduction with a null storeType
        null);


// *** Remainder reducer 
// takes:
//  inStoreType: store to use as template for reduction, as storeType 
//  ...inActionTypes: array of actions to use sequentially for reduction, as actionType
// returns storeType
export const remainderReducer = (inStoreType) => (...inActionTypes) =>
    // apply each of the actions to the input store in sequential order
    inActionTypes.flat(Infinity).reduce((accumStoreType, curActionType) =>
        // list of "mini" reducer functions
        // each function is associated with an action type, given in brackets
        ({
            [ACTION_CLEAR_ACTION_QUEUE]: (storeType) => (_) =>
            ({
                ...storeType,
                actionFuncQueue: []
            }),

            [ACTION_DO_NOTHING]: (storeType) => (_) => storeType,

            [ACTION_JOURNAL_ADD_ENTRY]: (storeType) => (actionType) =>
            ({
                ...storeType,
                journal: [
                    ...storeType.journal,
                    {
                        time: simGetCurTime(storeType),
                        message: actionType.msgStringType,
                    }
                ],
            }),

            [ACTION_MUTABLE_RENDER]: (storeType) => (_) => mutable_renderStoreChanges(storeType),

            [ACTION_PHYSTYPE_DO_ACT]: (storeType) => (actionType) =>
            ({
                ...storeType,

                // set physType store to the given physTypeStore with the physType
                //  at the given index replaced with the physType returned from "act"
                physTypeStore: splice
                    (1)                                         // remove one element...
                    (actionType.indexIntType)                   // ... at the given index...
                    (storeType.physTypeStore)                   // ... in this physType store...
                    (actionType.physType.act(                   // ... and replace with physType from "act"
                        actionType.physType)
                    ),
            }),

            [ACTION_QUEUE_ADD_GEO_CHART_DATA]: (storeType) => (actionType) =>
            ({
                ...storeType,
                changes: [
                    ...storeType.changes,
                    (_) => mutable_updateGeoChartData(
                        actionType.chart,
                        actionType.dataIndexIntType,
                        actionType.colorStringType,
                        actionType.xyFloatTuple
                    ),
                ],
            }),

            [ACTION_QUEUE_ADD_STATUS_MESSAGE]: (storeType) => (actionType) =>
            ({
                ...storeType,
                changes: [
                    ...storeType.changes,
                    (storeType) => mutable_updateStatusBox(
                        actionType.statusBox,
                        'Time ' + roundTo(2)(simGetCurTime(storeType)) + ': ' + actionType.msgStringType
                    ),
                ],
            }),

            [ACTION_QUEUE_ADD_TIME_CHART_DATA]: (storeType) => (actionType) =>
            ({
                ...storeType,
                changes: [
                    ...storeType.changes,
                    (_) => mutable_updateTimeChartData(
                        actionType.chart,
                        actionType.dataIndexIntType,
                        actionType.labelStringType,
                        actionType.timeValFloatTuple
                    ),
                ],
            }),

            [ACTION_STORE_LOCK]: (storeType) => (_) =>
            ({
                ...storeType,
                locked: true,
            }),

            [ACTION_STORE_UNLOCK]: (storeType) => (_) =>
            ({
                ...storeType,
                locked: false,
            }),

            [ACTION_WATCH_SAVE_PHYSTYPE]: (storeType) => (actionType) =>
            ({
                ...storeType,
                savedPhysTypeStore: splice
                    (1)                                         // remove one element...
                    (actionType.indexIntType)                   // ... at the given index...
                    (storeType.savedPhysTypeStore)              // ... in this saved physType store...
                    (actionType.physType),                      // ... and replace with actionType.physType
            }),

            [ACTION_WATCH_QUEUE_COMPARE_SAVED]: (storeType) => (actionType) =>
            ({
                ...storeType,

                actionFuncQueue: [
                    ...storeType.actionFuncQueue,

                    // append actions returned by handleFunc
                    actionType.handleFunc(
                        // get a physType for handleFunc via these steps:
                        watchProps
                            // compare the saved physType[index]...        
                            (storeType.savedPhysTypeStore[actionType.indexIntType])

                            // ...to the current physType[index]...
                            (storeType.physTypeStore[actionType.indexIntType])

                            // ... observing the given props
                            (actionType.propsStringType)
                    ),
                ],
            }),

            // use curActionType.type as an entry key into the key-val list above
            // key is used to select a function that takes a storeType and actionType 
            //  and returns a storeType
            // if no key-val matches the entry key, return a func that echoes the given storeType
        }[curActionType.type] || ((storeType) => (_) => storeType))
            // evaluate the function with the storeType accumulator and current action to get a storeType
            (accumStoreType || inStoreType)
            (curActionType),

        // we start our reduction with a null storeType
        null);
