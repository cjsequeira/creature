'use strict'

// ****** Simulation rulebook ******
// Inspired by: https://ericlippert.com/2015/05/11/wizards-and-warriors-part-five/

// *** Our imports
import { seededRand, withinRange } from './util.js';
import { pctGetCond, pctUseConds } from './reduxlike/store_getters.js';


// *** String constants for rules that will be verbally expressed elsewhere
export const RULE_HIT_WALL = 'hit a wall! BOUNCE...';
export const RULE_CONDS_OUT_OF_LIMITS = 'conditions out of limits!';


// *** The rulebook
const ruleBook = {
    name: 'Is creatureType?',
    func: (pct) => pct.physicalElem.hasOwnProperty('conds'),
    yes: {
        name: '-- YES! Glucose and neuro in range?',
        func: (pct) => (pctGetCond(pct, 'glucose') > 0.0) && (pctGetCond(pct, 'neuro') < 100.0),
        yes: {
            name: '-- -- YES! Requesting behavior: idling?',
            func: (pct) => pctGetCond(pct, 'behavior_request') === 'idling',
            yes: {
                name: '-- -- -- YES! Behavior request approved: idling',
                func: (pct) => pctUseConds(pct,
                    {
                        behavior: pctGetCond(pct, 'behavior_request'),

                        // can't idle and wander!
                        speed: 0.0
                    }),
            },
            no: {
                name: '-- -- -- NO! Requesting behavior: wandering?',
                func: (pct) => pctGetCond(pct, 'behavior_request') === 'wandering',
                yes: {
                    name: '-- -- -- -- YES! Projected position in range?',
                    func: (pct) =>
                        withinRange(pctGetCond(pct, 'x') + pctGetCond(pct, 'speed') *
                            Math.sin(pctGetCond(pct, 'heading')),
                            0.0, 20.0) &&
                        withinRange(pctGetCond(pct, 'y') + pctGetCond(pct, 'speed') *
                            Math.cos(pctGetCond(pct, 'heading')),
                            0.0, 20.0),
                    yes: {
                        name: '-- -- -- -- -- YES! Behavior request approved: wandering',
                        func: (pct) => pctUseConds(pct,
                            {
                                behavior: pctGetCond(pct, 'behavior_request'),

                                // compute x and y based on given speed and heading 
                                x: pctGetCond(pct, 'x') + pctGetCond(pct, 'speed') *
                                    Math.sin(pctGetCond(pct, 'heading')),
                                y: pctGetCond(pct, 'y') + pctGetCond(pct, 'speed') *
                                    Math.cos(pctGetCond(pct, 'heading')),

                                // compute speed based on given accel
                                speed: pctGetCond(pct, 'speed') + pctGetCond(pct, 'accel'),
                            }),
                    },
                    no: {
                        name: RULE_HIT_WALL,
                        func: (pct) => pctUseConds(pct,
                            {
                                behavior: pctGetCond(pct, 'behavior_request'),

                                // compute x and y based on REVERSE of given speed and heading 
                                x: pctGetCond(pct, 'x') - pctGetCond(pct, 'speed') *
                                    Math.sin(pctGetCond(pct, 'heading')),
                                y: pctGetCond(pct, 'y') - pctGetCond(pct, 'speed') *
                                    Math.cos(pctGetCond(pct, 'heading')),

                                // spin heading around a bit (in radians)
                                heading: pctGetCond(pct, 'heading') + 2.0,
                            }),
                    },
                },
                no: {
                    name: '-- -- -- -- NO! Requesting behavior: eating?',
                    func: (pct) => pctGetCond(pct, 'behavior_request') === 'eating',
                    yes: {
                        name: '-- -- -- -- -- YES! Is food available?',
                        func: (pct) => seededRand(pct.physicalElem.seed, 0.0, 1.0)[1] > 0.2,
                        yes: {
                            name: '-- -- -- -- -- -- YES! Behavior request approved: eating',
                            func: (pct) => pctUseConds(pct,
                                {
                                    behavior: pctGetCond(pct, 'behavior_request'),

                                    // can't move if eating: no grab-and-go!
                                    speed: 0.0
                                }),
                        },
                        no: {
                            name: '-- -- -- -- -- -- NO! Behavior set to: idling',
                            func: (pct) => pctUseConds(pct,
                                {
                                    behavior: 'idling',

                                    // can't move if idling!
                                    speed: 0.0
                                }),
                        }
                    },
                    no: {
                        name: '-- -- -- -- -- NO! Requested behavior: sleeping?',
                        func: (pct) => pctGetCond(pct, 'behavior_request') === 'sleeping',
                        yes: {
                            name: '-- -- -- -- -- -- YES! Behavior request approved',
                            func: (pct) => pctUseConds(pct,
                                {
                                    behavior: 'sleeping',

                                    // can't move if sleeping!
                                    speed: 0.0
                                }),
                        },
                        no: {
                            name: '-- -- -- -- -- NO! Unknown behavior!',
                            func: (pct) => pct
                        }
                    },
                },
            }
        },
        no: {
            name: RULE_CONDS_OUT_OF_LIMITS,
            func: (pct) => pctUseConds(pct,
                {
                    behavior: 'frozen',
                }),
        }
    },
    no: {
        name: '-- NO! Return given physicalContainerType',
        func: (pct) => pct
    }
};


// *** Rulebook functions
// general rulebook resolver
// returns physicalContainerType with applied rule node
export const ResolveRules = (arg, node = ruleBook) => {
    const funcResult = node.func(arg);

    switch (funcResult) {
        case true: return ResolveRules(arg, node.yes);
        case false: return ResolveRules(arg, node.no);
        default: return {
            ...funcResult,
            lastRule: node
        };
    }
};