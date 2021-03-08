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
//  action: action to reduce, as actionType
// returns storetype
export const combineReducers = (templateStoreType) => (storeType) => (action) =>
    // ... for each property-object pair in the template storeType...
    Object.entries(templateStoreType).reduce((accumStoreType, curEntry) =>
    ({
        // include the storeType object built so far
        ...accumStoreType,

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
                    curEntry[1](accumStoreType)(action)
                ]
            ]
        )
    }),
        // start building storeType object using the given storeType
        storeType);
