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
//  inStoreTypeSim: store "sim" property object to use as template for reduction 
//  inActionType: action to use for reduction, as actionType
// returns storeType
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


// *** Remainder reducer 
// takes:
//  inStoreType: store to use as template for reduction, as storeType 
//  inActionType: action to use for reduction, as actionType
// returns storeType
export const remainderReducer = (inStoreType) => (inActionType) =>
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

        // use inActionType.type as an entry key into the key-val list above
        // key is used to select a function that takes a storeType and actionType 
        //  and returns a storeType
        // if no key-val matches the entry key, return a func that echoes the given storeType
    }[inActionType.type] || ((storeType) => (_) => storeType))
        // evaluate the function with the storeType and actionType to get a storeType
        (inStoreType)
        (inActionType);
