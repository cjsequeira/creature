'use strict'

// ****** Simulation rulebook ******
// Inspired by: https://ericlippert.com/2015/05/11/wizards-and-warriors-part-five/

// *** The rulebook
const ruleBook = {
    // is it a creatureType? (i.e. does it have 'conds' property?)
    func: (physicalType) => physicalType.hasOwnProperty('conds'),
    // yes:
    yes: {
        // are glucose and neuro in range?
        func: (creatureType) => ((creatureType.conds.glucose > 0.0) &&
            (creatureType.conds.neuro < 100.0)),
        // yes: return given creatureType
        yes: {
            func: (creatureType) => creatureType
        },
        // no: return creatureType with behavior of "frozen"
        no: {
            func: (creatureType) => ({
                ...creatureType,
                conds: {
                    ...creatureType.conds,
                    behavior: 'frozen'
                }
            })
        }
    },
    // no: return given physicalType
    no: {
        func: (physicalType) => physicalType
    }
};


// *** Rulebook functions
// general rulebook resolver
// returns physicalType
export const ResolveRules = (arg = {}, node = ruleBook) => {
    console.log(node.func.toString());
    let funcResult = node.func(arg);

    switch (funcResult) {
        case true:
            console.log('got true');
            return ResolveRules(arg, node.yes);
        case false:
            console.log('got false')
            return ResolveRules(arg, node.no);
        default:
            console.log(funcResult);
            return funcResult;
    }
};