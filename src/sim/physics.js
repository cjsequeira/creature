'use strict'

// ****** Code implementing laws of physics ******

// *** Our imports
// REFACTOR? Not happy about referencing app store directly - even if read-only
import { myStore } from '../index.js';

import {
    makeFuncChain,
    withinRange,
    boundToRange
} from '../util.js';

import {
    physTypeGetCond,
    physTypeUseConds,
    simGetTimeStep
} from '../reduxlike/store_getters.js';


// *** Public consolidator for physType physics functions
// takes: physType
// returns physType
export const physTypeDoPhysics = (physType) =>
    // function chain: get physType with new location -> get physType with wall collisions checked
    makeFuncChain(physType)(
        physTypeDoMovements,
        physTypeCheckWallCollisions
    );


// *** Internal physics functions
// return physType with location updated based on speed and heading
// takes: physType
// returns physType
const physTypeDoMovements = (physType) => {
    // define shorthand func to get cond from given physType
    const inGetCond = physTypeGetCond(physType);

    return physTypeUseConds
        (physType)
        ({
            // compute x and y based on given speed and heading
            x: inGetCond('x') + simGetTimeStep(myStore) * inGetCond('speed') * Math.sin(inGetCond('heading')),
            y: inGetCond('y') + simGetTimeStep(myStore) * inGetCond('speed') * Math.cos(inGetCond('heading')),

            // compute speed based on given accel
            speed: inGetCond('speed') + simGetTimeStep(myStore) * inGetCond('accel'),
        });
};

// return physType with parameters updated if wall collisions
// takes: physType
// returns physType
const physTypeCheckWallCollisions = (physType) => {
    // define shorthand func to get cond from given physType
    const inGetCond = physTypeGetCond(physType);

    // are x and y within world boundary?
    return (
        withinRange(0.1)(19.9)(inGetCond('x')) &&
        withinRange(0.1)(19.9)(inGetCond('y'))
    )
        // yes: return given physType
        ? physType

        // no: return physType with updated parameters due to wall collision
        : physTypeUseConds
            (physType)
            ({
                // bound x to the boundary limit plus a small margin
                x: boundToRange(0.1)(19.9)(inGetCond('x')),

                // bound y to the boundary limit plus a small margin
                y: boundToRange(0.1)(19.9)(inGetCond('y')),

                // spin heading around a bit (in radians)
                heading: inGetCond('heading') + 2.35,

                // establish a minimum speed
                speed: 1.0,
            });
};
