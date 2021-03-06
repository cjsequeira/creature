'use strict'

// *** Reducer for remainder properties of storeType

// *** Our imports
import {
    ACTION_CLEAR_ACTION_QUEUE,
    ACTION_DO_NOTHING,
    ACTION_JOURNAL_ADD_ENTRY,
    ACTION_MUTABLE_RENDER,
    ACTION_PHYSTYPE_DO_ACT,
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
