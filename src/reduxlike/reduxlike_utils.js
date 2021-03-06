'use strict'

// ****** Reduxlike utilities ******

// *** Reducer combining functions
// main reducer combining function
// allows the use of multiple reducers, each reducing to a different store property
// takes:
//  templateStoreType, as:
//      {
//          ...
//          property1: reducerFunc1
//          property2: reducerFunc2
//          ...
//      }
//  ...actionFuncs: array of functions returning actionType
// returns storetype
export const combineReducers = (templateStoreType) => (storeType) => (...actionFuncs) =>
    // for each action function in the given action functions list...
    actionFuncs.flat(Infinity).reduce((accumStoreTypefromFuncs, curActionFunc) =>
        // ... for each property-object pair in the template storeType...
        Object.entries(templateStoreType).reduce((accumStoreTypefromEntries, curEntry) =>
        ({
            // include the storeType object built so far
            ...accumStoreTypefromEntries,

            // include the property and associated object built from the 
            //  current [property, reducer function] pair in the template storeType
            ...Object.fromEntries(
                [
                    // make an entry
                    [
                        // property name
                        curEntry[0],

                        // object associated with property, built by applying the reducer func
                        //  located in curEntry[1] to the accumulated storeType and current action
                        curEntry[1](accumStoreTypefromEntries)(curActionFunc(accumStoreTypefromEntries))
                    ]
                ]
            )
        }),
            // start building inner storeType using the accumulated outer storeType from actionFunc reduction
            accumStoreTypefromFuncs),
        // start building outer storeType using the given storeType
        storeType);
