'use strict'

// *** Reducer for physTypeStore property array of storeType

// *** Our imports
import {
    ACTION_PHYSTYPE_ADD_PHYSTYPE,
    ACTION_PHYSTYPE_DELETE_PHYSTYPE,
    ACTION_PHYSTYPE_UPDATE_PHYSTYPE,
    ACTION_PHYSTYPE_UPDATE_SELECT_PHYSTYPES,
    ACTION_PHYSTYPE_UPDATE_SELECT_PHYSTYPES_RAND,
} from '../const_vals.js';

import {
    genPhysTypeAvailID,
    getPhysTypeID,
    getPhysTypeStore,
    getPhysTypeCondsObj,
    usePhysTypeConds,
    getSimSeed,
} from './store_getters.js';

import { splice } from '../utils.js';
import { rand_genRandTypeObjArray, rand_unwrapRandTypeObj } from '../sim/seeded_rand.js';


// *** PhysTypeStore reducer 
// reducer for "physTypeStore" property of storeType
// takes:
//  inStoreType: store to use as template for reduction, as storeType 
//  inActionType: action to use for reduction, as actionType
// returns storeType "physTypeStore" property array
export const physTypeStoreReducer = (inStoreType) => (inActionType) =>
    // list of "mini" reducer functions
    // each function is associated with an action type, given in brackets
    ({
        [ACTION_PHYSTYPE_ADD_PHYSTYPE]: (storeType) => (actionType) =>
        ([
            ...getPhysTypeStore(storeType),

            {
                ...actionType.physType,
                id: genPhysTypeAvailID(storeType)(0),
            },
        ]),

        [ACTION_PHYSTYPE_DELETE_PHYSTYPE]: (storeType) => (actionType) =>
            // keep only physTypes with IDs *not* matching the given ID
            getPhysTypeStore(storeType).filter(
                (ptToTest) => getPhysTypeID(ptToTest) !== actionType.idIntType
            ),

        [ACTION_PHYSTYPE_UPDATE_PHYSTYPE]: (storeType) => (actionType) =>
            // is the given physType located in the physTypeStore?  
            (getPhysTypeStore(storeType).findIndex((ptToFind) => ptToFind.id === actionType.physType.id)
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

                // no: return the physTypeStore unaltered
                : getPhysTypeStore(storeType),

        [ACTION_PHYSTYPE_UPDATE_SELECT_PHYSTYPES]: (storeType) => (actionType) =>
        // build an array out of two components
        // REFACTOR for efficiency
        ([
            // first, the updated physTypes that pass the filter function
            ...getPhysTypeStore(storeType)
                .filter(actionType.filterFunc)
                .map(actionType.updateFunc),

            // second, the physTypes that fail the filter function - these are left AS IS
            ...getPhysTypeStore(storeType)
                .filter((thisPt) => !actionType.filterFunc(thisPt)),
        ]),

        [ACTION_PHYSTYPE_UPDATE_SELECT_PHYSTYPES_RAND]: (storeType) => (actionType) =>
        // build an array out of two components
        // REFACTOR for efficiency
        ([
            // generate an array of randTypeObj objects
            ...rand_genRandTypeObjArray
                // conds objects of physTypes that pass the given filter function
                (getPhysTypeStore(storeType)
                    .filter(actionType.filterFunc)
                    .map((thisPt) => getPhysTypeCondsObj(thisPt)))

                // array of randType generator functions
                (actionType.gensForRand)

                // seed to start with
                (getSimSeed(storeType))

                // then unwrap each randTypeObj object and merge it back in with the appropriate physType
                .map(
                    (thisRandTypeObjConds, i) =>
                        // assign conds to physType
                        usePhysTypeConds
                            // select the associated physType using the same given filter func 
                            //  and the map index
                            (getPhysTypeStore(storeType).filter(actionType.filterFunc)[i])

                            // unwrap the randTypeObj conds into a conds object with random values
                            (rand_unwrapRandTypeObj(thisRandTypeObjConds))
                ),

            // also include the physTypes that fail the filter function - these are left AS IS
            ...getPhysTypeStore(storeType)
                .filter((thisPt) => !actionType.filterFunc(thisPt)),
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



