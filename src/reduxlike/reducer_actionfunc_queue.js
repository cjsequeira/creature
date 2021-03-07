'use strict'

// *** Reducer for "actionFuncQueue" properties of storeType

// *** Our imports
import {
    ACTION_ACTION_QUEUE_DO_ACTION_GROUP,
    ACTION_CLEAR_ACTION_QUEUE,
} from '../const_vals.js';


// *** ActionFunc queue reducer 
// reducer for "actionFuncQueue" property of storeType 
// takes:
//  inStoreType: store to use as template for reduction, as storeType 
//  inActionType: action to use for reduction, as actionType
// returns storeType "actionFuncQueue" property object
export const actionFuncQueueReducer = (inStoreType) => (inActionType) =>
    // list of "mini" reducer functions
    // each function is associated with an action type, given in brackets
    ({
        [ACTION_ACTION_QUEUE_DO_ACTION_GROUP]: (storeType) => (actionType) =>
        ([
            ...storeType.actionFuncQueue,

            actionType.actionGroupFunc(storeType),
        ]),

        [ACTION_CLEAR_ACTION_QUEUE]: (_) => (_) => ([]),

        // use inActionType.type as an entry key into the key-val list above
        // key is used to select a function that takes a storeType and actionType 
        //  and returns a storeType
        // if no key-val matches the entry key, return a func that echoes 
        //  the "actionFuncQueue" property of the given storeType
    }[inActionType.type] || ((storeType) => (_) => ([...storeType.actionFuncQueue])))
        // evaluate the function with the storeType and actionType 
        //  to get a storeType "actionFuncQueue" property object
        (inStoreType)
        (inActionType);
