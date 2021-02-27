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
const physTypeDoMovements = (physType) => physTypeUseConds(
    physType,
    {
        // compute x and y based on given speed and heading
        x: physTypeGetCond(physType, 'x') +
            simGetTimeStep(myStore) * physTypeGetCond(physType, 'speed') *
            Math.sin(physTypeGetCond(physType, 'heading')),
        y: physTypeGetCond(physType, 'y') +
            simGetTimeStep(myStore) * physTypeGetCond(physType, 'speed') *
            Math.cos(physTypeGetCond(physType, 'heading')),

        // compute speed based on given accel
        speed: physTypeGetCond(physType, 'speed') +
            simGetTimeStep(myStore) * physTypeGetCond(physType, 'accel'),
    });

// return physType with parameters updated if wall collisions
// takes: physType
// returns physType
const physTypeCheckWallCollisions = (physType) =>
    // are x and y within world boundary?
    (
        withinRange(0.1)(19.9)(physTypeGetCond(physType, 'x')) &&
        withinRange(0.1)(19.9)(physTypeGetCond(physType, 'y'))
    )
        // yes: return given physType
        ? physType

        // no: return physType with updated parameters due to wall collision
        : physTypeUseConds(
            physType,
            {
                // bound x to the boundary limit plus a small margin
                x: boundToRange(0.1)(19.9)(physTypeGetCond(physType, 'x')),

                // bound y to the boundary limit plus a small margin
                y: boundToRange(0.1)(19.9)(physTypeGetCond(physType, 'y')),

                // spin heading around a bit (in radians)
                heading: physTypeGetCond(physType, 'heading') + 2.35,

                // establish a minimum speed
                speed: 1.0,
            });
