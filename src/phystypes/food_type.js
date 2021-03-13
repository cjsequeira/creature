'use strict'

// ****** Simple Creature code ******

// *** Imports
import { event_updatePhysType } from '../rulebook/event_creators.js';
import { mutableRandGen_seededRand } from '../sim/seeded_rand.js';

import {
    WORLD_SIZE_X,
    WORLD_SIZE_Y,
} from '../const_vals.js';

import { roundTo } from '../utils.js';


// *** Default foodType assembler
// REFACTOR: MUST FIGURE A CLEAN WAY TO CHECK IDs FOR CONFLICTS!
// takes: 
//  don't care
// returns foodType
export const getDefaultFoodType = (_) =>
({
    name: 'New Food',
    color: '#00bb00ff',
    id: roundTo(0)(mutableRandGen_seededRand(0, 1e6)),
    act: actAsFood,
    conds: {
        // location
        x: mutableRandGen_seededRand(1.0, WORLD_SIZE_X - 1.0),
        y: mutableRandGen_seededRand(1.0, WORLD_SIZE_Y - 1.0),
    },
});


// *** Behavior functions unique to foodType
// main behavior function
// takes: 
//  storeType
//  physType
// returns eventType
export const actAsFood = (_) => (physType) => event_updatePhysType(physType);
