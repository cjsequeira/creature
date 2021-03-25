'use strict'

// *** Reducer for physTypeStore property array of storeType

// *** Our imports
import {
    ACTION_PHYSTYPE_ADD_PHYSTYPE,
    ACTION_PHYSTYPE_DELETE_PHYSTYPE,
    ACTION_PHYSTYPE_REPLACE_PHYSTYPE,
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

import {
    randMObj_genRandMObj,
    randM_nextSeed,
    randMObj_val,
} from '../sim/seeded_rand.js';


// *** mini physTypeStore reducer functions
const ptsRed_actionPhysTypeAddPhysType_func = (storeType, actionType) =>
([
    ...getPhysTypeStore(storeType),

    {
        ...actionType.physType,
        id: genPhysTypeAvailID(storeType, 0),
    },
]);

const ptsRed_actionPhysTypeDeletePhysType_func = (storeType, actionType) =>
    // keep only physTypes with IDs *not* matching the given ID
    getPhysTypeStore(storeType).filter(
        (ptToTest) => getPhysTypeID(ptToTest) !== getPhysTypeID(actionType.physType)
    );

const ptsRed_actionPhysTypeReplacePhysType_func = (storeType, actionType) =>
    // is the given physType located in the physTypeStore?  
    (getPhysTypeStore(storeType).findIndex
        ((ptToFind) => ptToFind.id === actionType.physType.id)
        > -1)
        // yes: create a new physTypeStore object by...
        ? splice(
            // ...deleting one item...
            1,

            // ... at the array index (as found by matching physType IDs)...

            getPhysTypeStore(storeType).findIndex(
                (ptToFind) => ptToFind.id === actionType.physType.id),

            // ... in the physTypeStore array...
            getPhysTypeStore(storeType),

            // ... and replacing with the given physType
            actionType.physType
        )

        // no: return the physTypeStore unaltered
        : getPhysTypeStore(storeType);

const ptsRed_actionPhysTypeUpdateSelectPhysTypes_func = (storeType, actionType) =>
    // for all physTypes in the physType store...
    getPhysTypeStore(storeType).map((thisPt) =>
        // ...does this physType pass the filter function?
        // filter func signature: (physType) => bool
        (actionType.filterFunc(thisPt))
            // yes: apply the update funcion
            // update func signature: (physType) => physType
            ? actionType.updateFunc(thisPt)

            // no: keep the physType the same
            : thisPt
    );

// REFACTOR: Simplify!
const ptsRed_actionPhysTypeUpdateSelectPhysTypesRand = (storeType, actionType) =>
    // NOTE: the simulator seed is updated in the SIM REDUCER!!!

    // generate a randMObj version of the physTypeStore
    getPhysTypeStore(storeType).reduce((accumRandMObj, thisPt) =>
        [
            ...accumRandMObj,

            // does this physType pass the filter function?
            (actionType.filterFunc(thisPt))
                // yes: create randMObj using given randM generators
                ? randMObj_genRandMObj
                    (
                        getPhysTypeCondsObj(thisPt),
                        actionType.gensForRand
                    )
                    (
                        // use the proper seed
                        (accumRandMObj.length > 0)
                            ? randM_nextSeed(accumRandMObj.slice(-1)[0])
                            : getSimSeed(storeType)
                    )

                // no: create randMObj with no randM generators
                // we do this in order to maintain the proper seed
                : randMObj_genRandMObj
                    (
                        getPhysTypeCondsObj(thisPt),
                        []
                    )
                    (
                        // use the proper seed
                        (accumRandMObj.length > 0)
                            ? randM_nextSeed(accumRandMObj.slice(-1)[0])
                            : getSimSeed(storeType)
                    )

            // start with an empty array
        ], [])

        // map each randMObj back to a physType with updated random conditions
        .map(
            (thisRandMObj, i) =>
                usePhysTypeConds
                    (
                        getPhysTypeStore(storeType)[i],
                        randMObj_val(thisRandMObj)
                    )
        );

const ptsRed_default_func = (storeType, _) =>
    ([...storeType.physTypeStore]);


// *** physTypeStore reducer main function
// reducer for "physTypeStore" property of storeType
// takes:
//  inStoreType: store to use as template for reduction, as storeType 
//  inActionType: action to use for reduction, as actionType
// returns storeType "physTypeStore" property array
export const physTypeStoreReducer = (inStoreType, inActionType) =>
    // list of "mini" reducer functions
    ({
        [ACTION_PHYSTYPE_ADD_PHYSTYPE]: ptsRed_actionPhysTypeAddPhysType_func,

        [ACTION_PHYSTYPE_DELETE_PHYSTYPE]: ptsRed_actionPhysTypeDeletePhysType_func,

        [ACTION_PHYSTYPE_REPLACE_PHYSTYPE]: ptsRed_actionPhysTypeReplacePhysType_func,

        [ACTION_PHYSTYPE_UPDATE_SELECT_PHYSTYPES]: ptsRed_actionPhysTypeUpdateSelectPhysTypes_func,

        [ACTION_PHYSTYPE_UPDATE_SELECT_PHYSTYPES_RAND]: ptsRed_actionPhysTypeUpdateSelectPhysTypesRand,

        // use inActionType.type as an entry key into the key-val list above
        // key is used to select a function that takes a storeType object  
        //  and actionType and returns a storeType "physTypeStore" prop obj
        // if no key-val matches the entry key, return a "default" func that echoes 
        //  the given storeType "physTypeStore" property array
    }[inActionType.type] || ptsRed_default_func)
        // evaluate the function with the storeType "physTypeStore" property array 
        //  and actionType to get a storeType "physTypeStore" property array
        (inStoreType, inActionType);
