'use strict'

// ****** Etude to experiment with watching changes on an object/property ******

// get the value at a nested property of an object
// takes:
//  obj: the object to look at
//  prop: the nested property, as a string, e.g. 'nest1.nest2.property'
// will also work with a non-nested property, e.g. 'toplevelproperty'
// returns the value at the nested property - could be undefined
const getNestedProp = (obj) => (prop) =>
    prop.split('.').reduce(
        (accum_obj, this_prop) => accum_obj[this_prop],
        obj);

// function to change some schtufffff
const funcToDo = (x) =>
({
    ...x,
    me: 'BOOOOM!',
    layer2: {
        ...x.layer2,
        two1: 'faaaaake',
    }
});


// function to apply given doFunc to obj and articulate whether props 
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


// *** Test code
let myObj = {
    me: 'yes',
    you: 'no',
    that: 'what',
    layer2: {
        two1: 'up',
        two2: 'down',
    },
};

console.log('________________________________________ ');
console.log(myObj);

const watchedObj = watchProps
    (myObj)
    (funcToDo)
    (['me', 'that'], 'layer2.two1', 'layer2.two2', 'nope')

console.log(watchedObj);
console.log('*** Did \'me\' change? ' + watchedObj.changes['me']);
console.log('*** Did \'that\' change? ' + watchedObj.changes['that']);
console.log('*** Did \'layer2.two1\' change? ' + watchedObj.changes['layer2.two1']);
console.log(' ');

// outta here
process.exit();
