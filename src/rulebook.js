'use strict'

// ****** Simulation rulebook ******
// Inspired by: https://ericlippert.com/2015/05/11/wizards-and-warriors-part-five/


// *** Rulebook functions
// general rulebook resolver
// returns physicalType
export const ResolveRules = (physicalType = {}) => {
    return (
        // is it a creatureType?
        (physicalType.hasOwnProperty('conds'))
            // yes: resolve rules for creatureType
            ? ResolveRules_CreatureType(physicalType)

            // no: return given physicalType
            : physicalType
    )
};

// rulebook resolver for creatureType
// returns creatureType
const ResolveRules_CreatureType = (creatureType = { conds: null }) => {
    return (
        // glucose and neuro in range?
        ((creatureType.conds.glucose > 0.0) && (creatureType.conds.neuro < 100.0))
            // yes: return given creatureType
            ? creatureType

            // no: return creatureType with behavior of 'frozen'
            : {
                ...creatureType,
                conds: {
                    ...creatureType.conds,
                    behavior: 'frozen'
                }
            }
    )
}