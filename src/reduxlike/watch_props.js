'use strict'

// ****** Code to watch properties and report on changes ******

// *** Our imports
import { getNestedProp } from '../util.js';


// *** Function to apply given doFunc to obj and articulate whether props 
//  changed after the application of doFunc
// even works on nested properties!
// takes:
//  before: object to apply to
//  doFunc: function to apply to object 'before'
//  ...props: list of props to watch
// returns object, with added/updated property 'changes', containing
//  each watched prop and a boolean answering 'did this property change?'
const watchProps = (beforeObj) => (doFunc) => (...props) =>
    (
        // anonymous function to build an object composed of: 
        //  'afterObj': the doFunc(obj) result
        //  a 'changes' property containing an object of given props and whether they changed
        (afterObj) => ({
            ...afterObj,

            changes: Object.fromEntries(
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
    )
        // apply doFunc to the given object and use the result as the "after" object
        //  for comparing property changes against the given object
        (doFunc(beforeObj))