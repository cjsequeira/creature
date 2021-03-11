'use strict'

// ****** Code to create application events ******

// *** Our imports
import { EVENT_UPDATE_PHYSTYPE } from '../const_vals.js';


// *** PhysType events
// update physType of the same ID as the given physType
// takes:
//  physType
// returns eventType
export const event_updatePhysType = (physType) =>
({
    type: EVENT_UPDATE_PHYSTYPE,
    physType,
});

