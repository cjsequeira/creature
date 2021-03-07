'use strict'

// *** Reducer for remainder properties of storeType

// *** Our imports
import {
    ACTION_DO_NOTHING,
    ACTION_JOURNAL_ADD_ENTRY,
    ACTION_PHYSTYPE_DO_ACT,
    ACTION_STORE_LOCK,
    ACTION_STORE_UNLOCK,
    ACTION_WATCH_SAVE_PHYSTYPE,
} from '../const_vals.js';

import { simGetCurTime } from './store_getters.js';
import { splice } from '../utils.js';


// *** Remainder reducer 
// reducer for "remainder" property of storeType
// takes:
//  inStoreType: store to use as template for reduction, as storeType 
//  inActionType: action to use for reduction, as actionType
// returns storeType "remainder" property object
export const remainderReducer = (inStoreType) => (inActionType) =>
    // list of "mini" reducer functions
    // each function is associated with an action type, given in brackets
    ({
        [ACTION_DO_NOTHING]: (storeType) => (_) => ({ ...storeType.remainder }),

        [ACTION_JOURNAL_ADD_ENTRY]: (storeType) => (actionType) =>
        ({
            ...storeType.remainder,
            journal: [
                ...storeType.remainder.journal,
                {
                    time: simGetCurTime(storeType),
                    message: actionType.msgStringType,
                }
            ],
        }),

        [ACTION_PHYSTYPE_DO_ACT]: (storeType) => (actionType) =>
        ({
            ...storeType.remainder,

            // set physType store to the given physTypeStore with the physType
            //  at the given index replaced with the physType returned from "act"
            physTypeStore: splice
                (1)                                         // remove one element...
                (actionType.indexIntType)                   // ... at the given index...
                (storeType.remainder.physTypeStore)         // ... in this physType store...
                (actionType.physType.act(                   // ... and replace with physType from "act"
                    actionType.physType)
                ),
        }),

        [ACTION_STORE_LOCK]: (storeType) => (_) =>
        ({
            ...storeType.remainder,
            locked: true,
        }),

        [ACTION_STORE_UNLOCK]: (storeType) => (_) =>
        ({
            ...storeType.remainder,
            locked: false,
        }),

        [ACTION_WATCH_SAVE_PHYSTYPE]: (storeType) => (actionType) =>
        ({
            ...storeType.remainder,
            savedPhysTypeStore: splice
                (1)                                         // remove one element...
                (actionType.indexIntType)                   // ... at the given index...
                (storeType.remainder.savedPhysTypeStore)    // ... in this saved physType store...
                (actionType.physType),                      // ... and replace with actionType.physType
        }),

        // use inActionType.type as an entry key into the key-val list above
        // key is used to select a function that takes a storeType object  
        //  and actionType and returns a storeType "remainder" prop obj
        // if no key-val matches the entry key, return a func that echoes 
        //  the given storeType "remainder" property object
    }[inActionType.type] || ((storeType) => (_) => ({ ...storeType.remainder })))
        // evaluate the function with the storeType "remainder" property object 
        //  and actionType to get a storeType "remainder" property object
        (inStoreType)
        (inActionType);
