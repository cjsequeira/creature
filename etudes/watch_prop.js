'use strict'

// ****** Etude to experiment with watching changes on an object/property ******

const watchObj = (obj) => (doFunc) => (prop) => {
    const after = doFunc(obj);

    return {
        ...after,
        changed: {
            [prop]: (obj[prop] === after[prop])
                ? false
                : true,
        }
    };
}

let myObj = { me: 'yes' };

console.log(' ');
console.log(myObj);
console.log(watchObj
    (myObj)
    (x => ({ ...x, me: 'yes' }))
    ('me')
);
console.log(watchObj
    (myObj)
    (x => ({ ...x, me: 'blarghh' }))
    ('me')
);

// outta here
process.exit();
