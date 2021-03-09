'use strict'

// ****** Code implementing laws of physics ******

// *** Our imports
import {
    WORLD_SIZE_X,
    WORLD_SIZE_Y,
} from '../const_vals.js';

import {
    applyFuncChain,
    boundToRange,
    withinRange,
} from '../utils.js';

import {
    physTypeGetCond,
    physTypeUseConds,
    simGetTimeStep,
} from '../reduxlike/store_getters.js';


// *** Public consolidator for physType physics functions
// takes: 
//  storeType
//  physType
// returns physType
export const physTypeDoPhysics = (storeType) => (physType) =>
    // function chain: 
    //  get physType with new location -> get physType with wall collisions checked
    applyFuncChain(physType)
        (
            physTypeDoMovements(storeType),
            physTypeCheckWallCollisions(storeType)
        );


// *** Internal physics functions
// return physType with location updated based on speed and heading
// takes: 
//  storeType
//  physType
// returns physType
const physTypeDoMovements = (storeType) => (physType) => {
    // get cond from given physType
    const inGetCond = physTypeGetCond(physType);

    return physTypeUseConds
        (physType)
        ({
            // compute x and y based on given speed and heading
            x: inGetCond('x') +
                simGetTimeStep(storeType) * inGetCond('speed') * Math.sin(inGetCond('heading')),
            y: inGetCond('y') +
                simGetTimeStep(storeType) * inGetCond('speed') * Math.cos(inGetCond('heading')),

            // compute speed based on given accel
            speed: inGetCond('speed') + simGetTimeStep(storeType) * inGetCond('accel'),
        });
};

// return physType with parameters updated if wall collisions
// takes: 
//  storeType
//  physType
// returns physType
const physTypeCheckWallCollisions = (_) => (physType) => {
    // define shorthand func to get cond from given physType
    const inGetCond = physTypeGetCond(physType);

    // are x and y within world boundary?
    return (
        withinRange(0.1)(WORLD_SIZE_X - 0.1)(inGetCond('x')) &&
        withinRange(0.1)(WORLD_SIZE_Y - 0.1)(inGetCond('y'))
    )
        // yes: return given physType
        ? physType

        // no: return physType with updated parameters due to wall collision
        : physTypeUseConds
            (physType)
            ({
                // bound x to the boundary limit minus a small margin
                x: boundToRange(0.1)(WORLD_SIZE_X - 0.1)(inGetCond('x')),

                // bound y to the boundary limit minus a small margin
                y: boundToRange(0.1)(WORLD_SIZE_Y - 0.1)(inGetCond('y')),

                // spin heading around a bit (in radians)
                heading: inGetCond('heading') + 2.35,

                // establish a minimum speed
                speed: 1.0,
            });
};
