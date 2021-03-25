'use strict'

// ****** Simple Creature code ******

// *** Imports
import { event_replacePhysType } from '../rulebook/event_creators.js';

import {
    WORLD_SIZE_X,
    WORLD_SIZE_Y,
} from '../const_vals.js';


// *** Default foodType assembler
// WARNING: Establishes object with null ID!
// takes: 
//  don't care
// returns foodType
export const getDefaultFoodType = (_) =>
({
    name: 'New Food',
    color: '#00bb00ff',
    id: null,
    act: actAsFood,
    conds: {
        // location
        x: WORLD_SIZE_X / 2.0,
        y: WORLD_SIZE_Y / 2.0,
    },
});


// *** Behavior functions unique to foodType
// main behavior function
// takes: 
//  storeType
//  physType
// returns eventType
export const actAsFood = (_, physType) => event_replacePhysType(physType);
