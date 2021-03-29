'use strict'

// ****** Code implementing laws of physics ******
// These are nested arrow functions to support easy composition, as the first argument
//  to all of them is a storeType

// *** Our imports
import {
    WORLD_SIZE_X,
    WORLD_SIZE_Y,
} from '../const_vals.js';

import {
    boundToRange,
    isWithinRange,
    partial2,
    pipe2,
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
export const physTypeDoPhysics = (storeType, physType) =>
    // function chain: must check wall collisions FIRST, because the check could
    //  adjust the acceleration/speed/heading used for movements
    pipe2
        (
            storeType,
            physType,
            [
                physTypeCheckWallCollisions,
                physTypeDoMovements,
            ]
        );


// *** Internal physics functions
// return physType with location updated based on speed and heading
// takes: 
//  storeType
//  physType
// returns physType
const physTypeDoMovements = (storeType, physType) =>
    usePhysTypeConds
        (
            physType,
            {
                // compute x and y based on given speed and heading
                x: getPhysTypeCond(physType, 'x') +
                    getSimTimeStep(storeType) * getPhysTypeCond(physType, 'speed') *
                    Math.sin(getPhysTypeCond(physType, 'heading')),
                y: getPhysTypeCond(physType, 'y') +
                    getSimTimeStep(storeType) * getPhysTypeCond(physType, 'speed') *
                    Math.cos(getPhysTypeCond(physType, 'heading')),

                // compute speed based on given accel
                speed: getPhysTypeCond(physType, 'speed') +
                    getSimTimeStep(storeType) * getPhysTypeCond(physType, 'accel'),
            }
        );

// return physType with parameters updated if wall collisions
// takes: 
//  don't care
//  physType
// returns physType
const physTypeCheckWallCollisions = (_, physType) =>
    // are x and y within world boundary?
    (
        isWithinRange(0.1, WORLD_SIZE_X - 0.1, getPhysTypeCond(physType, 'x')) &&
        isWithinRange(0.1, WORLD_SIZE_Y - 0.1, getPhysTypeCond(physType, 'y'))
    )
        // yes: return given physType
        ? physType

        // no: return physType with updated parameters due to wall collision
        : usePhysTypeConds
            (
                physType,
                {
                    // bound x to the boundary limit minus a small margin
                    x: boundToRange(0.1, WORLD_SIZE_X - 0.1, getPhysTypeCond(physType, 'x')),

                    // bound y to the boundary limit minus a small margin
                    y: boundToRange(0.1, WORLD_SIZE_Y - 0.1, getPhysTypeCond(physType, 'y')),

                    // spin heading around a bit (in radians)
                    heading: getPhysTypeCond(physType, 'heading') + 2.35,

                    // dissipate some speed - or establish a minimum speed if creature is going slowly
                    speed:
                        (getPhysTypeCond(physType, 'speed') > 3.0)
                            ? 0.96 * getPhysTypeCond(physType, 'speed')
                            : 3.0,
                }
            );
