'use strict'

// ****** Simulation rulebook ******
// Inspired by: https://ericlippert.com/2015/05/11/wizards-and-warriors-part-five/

// *** Our imports
import { ActAsSimpleCreature } from './creatures/simple_creature.js';
import { ActAsCrazyCreature } from './creatures/crazy_creature.js';


// *** Rulebook functions
// rulebook resolver
// returns physicalType
export const ResolveRules = (physicalType = {}) => {
    switch (physicalType.act) {
        // Simple Creature and Crazy Creature: active if glucose > 0.0 and neuro < 100.0, otherwise freezes
        case ActAsSimpleCreature: 
        case ActAsCrazyCreature: return (
            // glucose and neuro in range?
            ((physicalType.conds.glucose > 0.0) && (physicalType.conds.neuro < 100.0))
                // yes: return physicalType given by action
                ? physicalType.act(physicalType)

                // no: return physicalType with behavior of 'frozen'
                : {
                    ...physicalType,
                    conds: {
                        ...physicalType.conds,
                        behavior: 'frozen'
                    }
                }
        )

        // act not in rules list above? return given physicalType
        default: return physicalType
    }
};