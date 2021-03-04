'use strict'

// ****** Code to watch properties and report on changes ******

// *** Our imports
import { WATCHPROP_CHANGESPROP } from '../const_vals.js';
import { getNestedProp } from '../util.js';


// *** Function to articulate whether a given property is different between
//  a given "before" object and a given "after" object
// even works on nested properties!
// takes:
//  before: object before changes
//  after: object after changes
//  ...propStringTypes: list of props to watch, as strings
// returns "after" object with added/updated property [WATCHPROP_CHANGESPROP], containing
//  each watched prop and a boolean answering 'did this property change?'
export const watchProps = (beforeObj) => (afterObj) => (...propStringTypes) =>
// build an object composed of: 
//  'afterObj': the given "after" object
//  a 'changes' property containing an object of given props and whether they changed
({
    ...afterObj,

    [WATCHPROP_CHANGESPROP]: Object.fromEntries(
        // build an array of properties, and compare the given 'before' object to
        //  the 'after' object to see whether the listed properties 
        //  changed or not
        // true: property changed from 'before' to 'after'
        // false: property did not change from 'before' to 'after'
        propStringTypes.flat(Infinity).reduce((accumProp, propStringType) =>
            // build an array of properties...
            [
                ...accumProp,
                [
                    propStringType,
                    (getNestedProp(beforeObj)(propStringType) === getNestedProp(afterObj)(propStringType))
                        ? false
                        : true
                ]
            ],
            // ...starting with an empty array
            [])
    ),
})
