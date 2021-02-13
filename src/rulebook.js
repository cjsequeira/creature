'use strict'

// ****** Simulation rulebook ******
// Inspired by: https://ericlippert.com/2015/05/11/wizards-and-warriors-part-five/

// *** Our imports
import { seededRand } from './util.js';


// *** The rulebook
const ruleBook = {
    name: 'Is creatureType?',
    func: (physicalType) => physicalType.hasOwnProperty('conds'),
    // yes:
    yes: {
        name: '-- YES! Glucose and neuro in range?',
        func: (creatureType) => ((creatureType.conds.glucose > 0.0) &&
            (creatureType.conds.neuro < 100.0)),
        // yes: 
        yes: {
            name: '---- YES! Requesting behavior: eating?',
            func: (creatureType) => creatureType.conds.behavior_request === 'eating',
            // yes:
            yes: {
                name: '------ YES! Is food available?',
                func: (creatureType) => seededRand(creatureType.seed, 0.0, 1.0)[1] > 0.2,
                yes: {
                    name: '-------- YES! Behavior request approved: eating',
                    func: (creatureType) => ({
                        ...creatureType,
                        seed: seededRand(creatureType.seed, 0.0, 1.0)[0],
                        conds: {
                            ...creatureType.conds,
                            behavior: creatureType.conds.behavior_request
                        }
                    })
                },
                no: {
                    name: '-------- NO! Behavior request set to idle',
                    func: (creatureType) => ({
                        ...creatureType,
                        seed: seededRand(creatureType.seed, 0.0, 1.0)[0],
                        conds: {
                            ...creatureType.conds,
                            behavior: 'idling'
                        }
                    })
                }
            },
            no: {
                name: '------ NO! Behavior request approved',
                func: (creatureType) => ({
                    ...creatureType,
                    conds: {
                        ...creatureType.conds,
                        behavior: creatureType.conds.behavior_request
                    }
                })
            },
        },
        // no: return creatureType with behavior of "frozen"
        no: {
            name: '-- NO! Behavior set to: frozen',
            func: (creatureType) => ({
                ...creatureType,
                conds: {
                    ...creatureType.conds,
                    behavior: 'frozen'
                }
            })
        }
    },
    no: {
        name: 'NO! Return given physicalType',
        func: (physicalType) => physicalType
    }
};


// *** Rulebook functions
// general rulebook resolver
// returns physicalType
export const ResolveRules = (arg = {}, node = ruleBook) => {
    console.log(node.name);
    let funcResult = node.func(arg);

    switch (funcResult) {
        case true: return ResolveRules(arg, node.yes);
        case false: return ResolveRules(arg, node.no);
        default: return funcResult;
    }
};