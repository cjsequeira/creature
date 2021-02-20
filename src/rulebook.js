'use strict'

// ****** Simulation rulebook ******
// Inspired by: https://ericlippert.com/2015/05/11/wizards-and-warriors-part-five/

// *** Our imports
import { physTypeGetCond, physTypeUseConds } from './reduxlike/store_getters.js';
import { physTypeDoPhysics } from './sim/physics.js';
import { randGen, mutableRandGen_seededRand } from './sim/seeded_rand.js';


// *** The rulebook
const ruleBook = {
    name: 'Is creatureType?',
    testFunc: (physType) => physType.hasOwnProperty('conds'),
    yes: {
        name: '-- YES! Glucose and neuro in range?',
        testFunc: (physType) => (physTypeGetCond(physType, 'glucose') > 0.0) && (physTypeGetCond(physType, 'neuro') < 100.0),
        yes: {
            // produce creatureType object with laws of physics applied
            preFunc: (physType) => physTypeDoPhysics(physType),
            name: '-- -- YES! Requesting behavior: idling?',
            testFunc: (physType) => physTypeGetCond(physType, 'behavior_request') === 'idling',
            yes: {
                name: '-- -- -- -- YES! Behavior request approved: idling',
                func: (physType) => physTypeUseConds(physType,
                    {
                        behavior: physTypeGetCond(physType, 'behavior_request'),
                    }),
            },
            no: {
                name: '-- -- -- NO! Requesting behavior: wandering?',
                testFunc: (physType) => physTypeGetCond(physType, 'behavior_request') === 'wandering',
                yes: {
                    name: '-- -- -- -- -- YES! Behavior request approved: wandering',
                    func: (physType) => physTypeUseConds(physType,
                        {
                            behavior: physTypeGetCond(physType, 'behavior_request'),

                            // compute speed based on given accel
                            speed: physTypeGetCond(physType, 'speed') + physTypeGetCond(physType, 'accel'),
                        }),
                },
                no: {
                    name: '-- -- -- -- NO! Requesting behavior: eating?',
                    testFunc: (physType) => physTypeGetCond(physType, 'behavior_request') === 'eating',
                    yes: {
                        name: '-- -- -- -- -- YES! Is food available?',
                        testFunc: (physType) => mutableRandGen_seededRand(randGen, 0.0, 1.0) > 0.3,
                        yes: {
                            name: '-- -- -- -- -- -- YES! Behavior request approved: eating',
                            func: (physType) => physTypeUseConds(physType,
                                {
                                    behavior: physTypeGetCond(physType, 'behavior_request'),

                                    // can't move if eating: no grab-and-go!
                                    speed: 0.0,
                                    accel: 0.0
                                }),
                        },
                        no: {
                            name: "wants to eat but there's no food here!",
                            verbalize: true,
                            func: (physType) => physTypeUseConds(physType,
                                {
                                    // set behavior to 'idling'
                                    behavior: 'idling',
                                }),
                        }
                    },
                    no: {
                        name: '-- -- -- -- -- NO! Requested behavior: sleeping?',
                        testFunc: (physType) => physTypeGetCond(physType, 'behavior_request') === 'sleeping',
                        yes: {
                            name: '-- -- -- -- -- -- YES! Behavior request approved',
                            func: (physType) => physTypeUseConds(physType,
                                {
                                    behavior: 'sleeping',

                                    // can't move if sleeping!
                                    speed: 0.0,
                                    accel: 0.0
                                }),
                        },
                        no: {
                            name: '-- -- -- -- -- -- NO! Unknown behavior!',
                            func: (physType) => physType
                        }
                    },
                },
            }
        },
        no: {
            name: 'conditions out of limits!',
            verbalize: true,
            func: (physType) => physTypeUseConds(physType,
                {
                    behavior: 'frozen',
                }),
        }
    },
    no: {
        name: '-- NO! Return given physType',
        func: (physType) => physType,
    }
};


// *** Rulebook functions
// general rulebook resolver
// returns physContainerType with applied rule and record of rule used
// REFACTOR IDEA:
//  Determine whether to save last-used rule in a pct or some other structure (e.g. a store list with a creature lookup)
export const resolveRules = (physType) => {
    // get physContainerType with selected rule and a physType to apply the rule to
    const pct_to_use = findRule(physType);

    // return physContainerType with lastRule: selected rule, and physType: with selected rule applied
    return {
        ...pct_to_use,
        lastRule: pct_to_use.lastRule,
        physType: pct_to_use.lastRule.func(pct_to_use.physType)
    }
}

// rulebook node finder
// returns physContainerType with function (named "func") that should be applied to the physType
const findRule = (physType, node = ruleBook) => {
    // is pre-function undefined? if yes, go forward with physType. if no, go forward with preFunc(physType)
    const physType_to_use = (node.preFunc === undefined) ? physType : node.preFunc(physType);

    // is test function undefined?
    return (node.testFunc === undefined)
        // yes: return the physContainerType
        ? {
            lastRule: node,
            physType: physType_to_use
        }

        // no: apply the test func to the physType
        : (node.testFunc(physType_to_use))
            // test func returned true? follow node.yes
            ? findRule(physType_to_use, node.yes)

            // test func returned false? follow node.no
            : findRule(physType_to_use, node.no)
}
