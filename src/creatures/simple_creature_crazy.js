'use strict'

// ****** Simple Creature - Crazy code ******
// Variant of Simple Creature

// *** Imports
import { CheckBehavior } from './simple_creature.js';


// *** Behavior functions 
// idling behavior function
// returns creatureType
const ActIdling = (creatureType) =>
    CheckBehavior(
        // pass in creatureType object with specific glucose and neuro
        {
            ...creatureType,
            conds: {
                ...creatureType.conds,
                glucose: creatureType.conds.glucose - 2.4,
                neuro: creatureType.conds.neuro + 1.2,
            }
        },
        // pass in behavior change desires specific to this behavior function
        {
            'idling': () => 1.0,
            'eating': (creatureType) => (creatureType.conds.glucose < 30.0) ? 1.0 : 0.5,
            'sleeping': (creatureType) => (creatureType.conds.neuro > 70.0) ? 1.0 : 0.5,
        }
    );

// eating behavior function
// returns creatureType
const ActEating = (creatureType) =>
    CheckBehavior(
        // pass in creatureType object with specific glucose and neuro
        {
            ...creatureType,
            conds: {
                ...creatureType.conds,
                glucose: creatureType.conds.glucose + 4.0,
                neuro: creatureType.conds.neuro + 2.6,
            }
        },
        // pass in behavior change desires specific to this behavior function
        {
            'eating': () => 1.0,
            'idling': (creatureType) => (creatureType.conds.glucose > 45.0) ? 1.0 : 0.5
        }
    );

// sleeping behavior function
// returns creatureType
const ActSleeping = (creatureType) =>
    CheckBehavior(
        // pass in creatureType object with specific glucose and neuro
        {
            ...creatureType,
            conds: {
                ...creatureType.conds,
                glucose: creatureType.conds.glucose - 1.0,
                neuro: creatureType.conds.neuro - 2.2,
            }
        },
        // pass in behavior change desires specific to this behavior function
        {
            'sleeping': () => 1.0,
            'idling': (creatureType) => (creatureType.conds.neuro < 60.0) ? 1.0 : 0.5
        }
    );


// *** Main dispatch function
// returns creatureType
export const ActAsSimpleCreature_Crazy = (creatureType) => {
    switch (creatureType.conds.behavior) {
        case 'idling': return ActIdling(creatureType)
        case 'eating': return ActEating(creatureType)
        case 'sleeping': return ActSleeping(creatureType)
        default: return creatureType
    }
};