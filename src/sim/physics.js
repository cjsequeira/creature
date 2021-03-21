'use strict'

// ****** Code implementing laws of physics ******

// *** Our imports
import {
    WORLD_SIZE_X,
    WORLD_SIZE_Y,
} from '../const_vals.js';

import {
    pipe,
    boundToRange,
    withinRange,
} from '../utils.js';

import {
    getPhysTypeCond,
    usePhysTypeConds,
    getSimTimeStep,
} from '../reduxlike/store_getters.js';


// *** Public consolidator for physType physics functions
// takes: 
//  storeType
//  physType
// returns physType
export const physTypeDoPhysics = (storeType) => (physType) =>
    // function chain: must check wall collisions FIRST, because the check could
    //  adjust the acceleration/speed/heading used for movements
    pipe
        (
            physTypeCheckWallCollisions(storeType),
            physTypeDoMovements(storeType),
        )
        (physType);


// *** Internal physics functions
// return physType with location updated based on speed and heading
// takes: 
//  storeType
//  physType
// returns physType
const physTypeDoMovements = (storeType) => (physType) => {
    // get cond from given physType
    const inGetCond = getPhysTypeCond(physType);

    return usePhysTypeConds
        (physType)
        ({
            // compute x and y based on given speed and heading
            x: inGetCond('x') +
                getSimTimeStep(storeType) * inGetCond('speed') * Math.sin(inGetCond('heading')),
            y: inGetCond('y') +
                getSimTimeStep(storeType) * inGetCond('speed') * Math.cos(inGetCond('heading')),

            // compute speed based on given accel
            speed: inGetCond('speed') + getSimTimeStep(storeType) * inGetCond('accel'),
        });
};

// return physType with parameters updated if wall collisions
// takes: 
//  storeType
//  physType
// returns physType
const physTypeCheckWallCollisions = (storeType) => (physType) => {
    // define shorthand func to get cond from given physType
    const inGetCond = getPhysTypeCond(physType);

    // are x and y within world boundary?
    return (
        withinRange(0.1)(WORLD_SIZE_X - 0.1)(inGetCond('x')) &&
        withinRange(0.1)(WORLD_SIZE_Y - 0.1)(inGetCond('y'))
    )
        // yes: return given physType
        ? physType

        // no: return physType with updated parameters due to wall collision
        : usePhysTypeConds
            (physType)
            ({
                // bound x to the boundary limit minus a small margin
                x: boundToRange(0.1)(WORLD_SIZE_X - 0.1)(inGetCond('x')),

                // bound y to the boundary limit minus a small margin
                y: boundToRange(0.1)(WORLD_SIZE_Y - 0.1)(inGetCond('y')),

                // spin heading around a bit (in radians)
                heading: inGetCond('heading') + 2.35,

                // dissipate some speed - or establish a minimum speed if creature is going slowly
                speed:
                    (inGetCond('speed') > 3.0)
                        ? 0.9 * inGetCond('speed')
                        : 3.0,
            });
};
