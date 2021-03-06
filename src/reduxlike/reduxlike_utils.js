'use strict'

// ****** Reduxlike utilities ******

// *** Reducer combining functions
// main reducer combining function
// allows the use of multiple reducers, each reducing to a different store property
// takes:
//  templateStoreType, as 
//      {
//          ...
//          property: reducerFunc
//          ...
//      }
//  inStoreType, as storeType
//  inActionType, as actionType
// returns storetype
export const combineReducers = (templateStoreType) => (storeType) => (...actionFuncs) => ({
    ...Object.fromEntries(
        Object.entries(templateStoreType).reduce(
            (accum, curEntry) => ([
                ...accum,
                [
                    curEntry[0],
                    curEntry[1](storeType)(
                        actionFuncs.flat(Infinity).map(actionFunc => actionFunc(storeType))
                    )
                ]
            ]), [])
    )
});

// reducer combining function with remainder
// takes:
//  templateStoreType, as storeType
//  remainderFunc: remainder reducer function giving storeType
//  inStoreType, as storeType
//  inActionType, as actionType
// returns storeType
export const combineReducersWithRemainder = (templateStoreType) => (remainderFunc) =>
    (storeType) => (...actionFuncs) => ({
        ...remainderFunc(storeType)(
            actionFuncs.flat(Infinity).map(actionFunc => actionFunc(storeType))
        ),

        ...combineReducers(templateStoreType)(storeType)(actionFuncs),
    });
