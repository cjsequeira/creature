'use strict'

// ****** Reduxlike utilities ******

// *** Reducer combining functions
// main reducer combining function
// allows the use of multiple reducers, each reducing to a different store property
// takes:
//  templateStoreType, as 
//      {
//          ...
//          property1: reducerFunc1
//          property2: reducerFunc2
//          ...
//      }
//  storeType
//  ...actionFuncs: array of functions returning actionType
// returns storetype
export const combineReducers = (templateStoreType) => (storeType) => (...actionFuncs) =>
({
    // ... produce storeType property objects from entries...
    ...Object.fromEntries(
        // ... generated using the property objects from the template storeType
        Object.entries(templateStoreType).reduce((accumEntries, curEntry) =>
        ([
            // include all property object entries generated so far
            ...accumEntries,

            // add an object entry
            [
                // for the property of the current object entry...
                curEntry[0],

                // ... build an object by reducing the list of action functions through
                //  applying the template-specified reducer for this property (in curEntry[1])
                //  to the accumulated storeType property object and each action below (as produced  
                //  through evaluation of each action function with the accumulated storeType)
                actionFuncs.flat(Infinity).reduce((accumStoreTypePropObj, curActionFunc) =>
                    curEntry[1]
                        (accumStoreTypePropObj || storeType[curEntry[0]])
                        (curActionFunc(accumStoreTypePropObj || storeType[curEntry[0]])),

                    // start with a null object
                    null)
            ]
        ]),
            // we start our template storeType reduction with a null array of object entries
            [])
    )
});


// reducer combining function with remainder
// takes:
//  templateStoreType, as storeType
//  remainderFunc: remainder reducer function giving storeType
//  storeType
//  ...actionFuncs: array of functions returning actionType
// returns storeType
export const combineReducersWithRemainder =
    (templateStoreType) => (remainderFunc) => (storeType) => (...actionFuncs) =>
    // produce an object
    ({
        // for each action function in the list of action funcs...
        ...actionFuncs.flat(Infinity).reduce((accumStoreType, curActionFunc) =>
            // ... evaluate the remainder reducer function with the storeType accumulator 
            //  and current action (as created through applying action function to the
            //  accumulated storeType) to get a storeType
            remainderFunc
                (accumStoreType || storeType)
                (curActionFunc(accumStoreType || storeType)),
            // we start our reduction with a null storeType
            null),

        // merge in the result objects from the other reducer functions as given in 
        //  the template storeType
        ...combineReducers(templateStoreType)(storeType)(actionFuncs),
    });
