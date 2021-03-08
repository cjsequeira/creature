'use strict'

// *** Reducer for "actionQueue" properties of storeType

// *** Our imports
import {
    ACTION_ACTION_QUEUE_COMPARE_PHYSTYPE,
    ACTION_ACTION_QUEUE_DO_ACTION_GROUP,
    ACTION_CLEAR_ACTION_QUEUE,
} from '../const_vals.js';
import { watchProps } from './watch_props.js';


// *** Action queue reducer 
// reducer for "actionQueue" property of storeType 
// takes:
//  inStoreType: store to use as template for reduction, as storeType 
//  inActionType: action to use for reduction, as actionType
// returns storeType "actionQueue" property object
export const actionQueueReducer = (inStoreType) => (inActionType) =>
    // list of "mini" reducer functions
    // each function is associated with an action type, given in brackets
    ({
        [ACTION_ACTION_QUEUE_DO_ACTION_GROUP]: (storeType) => (actionType) =>
        ([
            ...storeType.actionQueue,

            actionType.actionGroupFunc(storeType),
        ]),

        [ACTION_ACTION_QUEUE_COMPARE_PHYSTYPE]: (storeType) => (actionType) =>
        ([
            ...storeType.actionQueue,

            actionType.compareFunc(
                watchProps
                    (storeType.savedPhysTypeStore[actionType.indexIntType])
                    (storeType.physTypeStore[actionType.indexIntType])
                    (actionType.propsStringType)
            )
        ]),

        [ACTION_CLEAR_ACTION_QUEUE]: (_) => (_) => ([]),

        // use inActionType.type as an entry key into the key-val list above
        // key is used to select a function that takes a storeType and actionType 
        //  and returns a storeType
        // if no key-val matches the entry key, return a func that echoes 
        //  the "actionQueue" property of the given storeType
    }[inActionType.type] || ((storeType) => (_) => ([...storeType.actionQueue])))
        // evaluate the function with the storeType and actionType 
        //  to get a storeType "actionQueue" property object
        (inStoreType)
        (inActionType);
