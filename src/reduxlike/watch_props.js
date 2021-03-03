'use strict'

// ****** Code to watch properties and report on changes ******

// *** Our imports
import { getNestedProp } from '../util.js';


// *** Function to articulate whether a given property is different between
//  a given "before" object and a given "after" object
// even works on nested properties!
// takes:
//  before: object before changes
//  after: object after changes
//  ...props: list of props to watch
// returns "after" object with added/updated property 'changes', containing
//  each watched prop and a boolean answering 'did this property change?'
export const watchProps = (beforeObj) => (afterObj) => (...props) =>
// build an object composed of: 
//  'afterObj': the given "after" object
//  a 'changes' property containing an object of given props and whether they changed
({
    ...afterObj,

    _watchProps_changes: Object.fromEntries(
        // build an array of properties, and compare the given 'before' object to
        //  the 'after' object to see whether the listed properties 
        //  changed or not
        // true: property changed from 'before' to 'after'
        // false: property did not change from 'before' to 'after'
        props.flat(Infinity).reduce((accum, prop) =>
            // build an array...
            [
                ...accum,
                [
                    prop,
                    (getNestedProp(beforeObj)(prop) === getNestedProp(afterObj)(prop))
                        ? false
                        : true
                ]
            ],
            // ...starting with an empty array
            [])
    ),
})
