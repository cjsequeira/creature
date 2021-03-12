'use strict'

// *** Reducer for physTypeStore property array of storeType

// *** Our imports
import {
    ACTION_PHYSTYPE_UPDATE_PHYSTYPE,
} from '../const_vals.js';

import { getPhysTypeStore } from './store_getters.js';
import { splice } from '../utils.js';


// *** Remainder reducer 
// reducer for "physTypeStore" property of storeType
// takes:
//  inStoreType: store to use as template for reduction, as storeType 
//  inActionType: action to use for reduction, as actionType
// returns storeType "physTypeStore" property array
export const physTypeStoreReducer = (inStoreType) => (inActionType) =>
    // list of "mini" reducer functions
    // each function is associated with an action type, given in brackets
    ({
        [ACTION_PHYSTYPE_UPDATE_PHYSTYPE]: (storeType) => (actionType) =>
        ([
            // is the given physType located in the physTypeStore?  
            ...(getPhysTypeStore(storeType).findIndex((ptToFind) => ptToFind.id === actionType.physType.id)
                > -1)

                // yes: update it
                ? splice
                    // delete one item...
                    (1)

                    // ... at the array index (as found by matching physType IDs)...
                    (
                        getPhysTypeStore(storeType).findIndex(
                            (ptToFind) => ptToFind.id === actionType.physType.id)
                    )

                    // ... in the physTypeStore array...
                    (getPhysTypeStore(storeType))

                    // ... and replace with the given physType
                    (actionType.physType)

                // no: return the store unaltered
                : getPhysTypeStore(storeType)
        ]),

        // use inActionType.type as an entry key into the key-val list above
        // key is used to select a function that takes a storeType object  
        //  and actionType and returns a storeType "physTypeStore" prop obj
        // if no key-val matches the entry key, return a func that echoes 
        //  the given storeType "physTypeStore" property array
    }[inActionType.type] || ((storeType) => (_) => ([...storeType.physTypeStore])))
        // evaluate the function with the storeType "physTypeStore" property array 
        //  and actionType to get a storeType "physTypeStore" property array
        (inStoreType)
        (inActionType);
