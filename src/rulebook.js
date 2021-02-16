'use strict'

// ****** Simulation rulebook ******
// Inspired by: https://ericlippert.com/2015/05/11/wizards-and-warriors-part-five/

// *** Our imports
import { boundToRange, seededRand, withinRange } from './util.js';
import { pctGetCond, pctUseConds } from './reduxlike/store_getters.js';


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
                name: '-- -- -- YES! Projected position in range?',
                func: (pct) => (
                    withinRange(pctGetCond(pct, 'x') + pctGetCond(pct, 'speed') * Math.sin(pctGetCond(pct, 'heading')), 0.0, 20.0) &&
                    withinRange(pctGetCond(pct, 'y') + pctGetCond(pct, 'speed') * Math.cos(pctGetCond(pct, 'heading')), 0.0, 20.0)
                ),
                yes: {
                    name: '-- -- -- -- YES! Behavior request approved: idling',
                    func: (pct) => pctUseConds(pct,
                        {
                            behavior: pctGetCond(pct, 'behavior_request'),

                            // compute x and y based on given speed and heading to implement "coasting" activity
                            x: pctGetCond(pct, 'x') + pctGetCond(pct, 'speed') *
                                Math.sin(pctGetCond(pct, 'heading')),
                            y: pctGetCond(pct, 'y') + pctGetCond(pct, 'speed') *
                                Math.cos(pctGetCond(pct, 'heading')),
                        }),
                },
                no: {
                    name: 'coasted into a wall! BOUNCE... ',
                    verbalize: true,
                    func: (pct) => pctUseConds(pct,
                        {
                            behavior: pctGetCond(pct, 'behavior_request'),

                            // bound projected x to the boundary limit
                            x: boundToRange(pctGetCond(pct, 'x') + pctGetCond(pct, 'speed') *
                                Math.sin(pctGetCond(pct, 'heading')), 0.0, 20.0),

                            // bound projected y to the boundary limit
                            y: boundToRange(pctGetCond(pct, 'y') + pctGetCond(pct, 'speed') *
                                Math.cos(pctGetCond(pct, 'heading')), 0.0, 20.0),

                            // spin heading around a bit (in radians)
                            heading: pctGetCond(pct, 'heading') + 2.35,

                            // establish a minimum speed
                            speed: 1.0,
                        }),
                },
            },
            no: {
                name: '-- -- -- NO! Requesting behavior: wandering?',
                func: (pct) => pctGetCond(pct, 'behavior_request') === 'wandering',
                yes: {
                    name: '-- -- -- -- YES! Projected position in range?',
                    func: (pct) => (
                        withinRange(pctGetCond(pct, 'x') + pctGetCond(pct, 'speed') * Math.sin(pctGetCond(pct, 'heading')), 0.0, 20.0) &&
                        withinRange(pctGetCond(pct, 'y') + pctGetCond(pct, 'speed') * Math.cos(pctGetCond(pct, 'heading')), 0.0, 20.0)
                    ),
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
                        name: 'wandered into a wall! BOUNCE... ',
                        verbalize: true,
                        func: (pct) => pctUseConds(pct,
                            {
                                behavior: pctGetCond(pct, 'behavior_request'),

                                // bound projected x to the boundary limit
                                x: boundToRange(pctGetCond(pct, 'x') + pctGetCond(pct, 'speed') *
                                    Math.sin(pctGetCond(pct, 'heading')), 0.0, 20.0),

                                // bound projected y to the boundary limit
                                y: boundToRange(pctGetCond(pct, 'y') + pctGetCond(pct, 'speed') *
                                    Math.cos(pctGetCond(pct, 'heading')), 0.0, 20.0),

                                // spin heading around a bit (in radians)
                                heading: pctGetCond(pct, 'heading') + 2.35,

                                // establish a minimum speed
                                speed: 1.0,
                            }),
                    },
                },
                no: {
                    name: '-- -- -- -- NO! Requesting behavior: eating?',
                    func: (pct) => pctGetCond(pct, 'behavior_request') === 'eating',
                    yes: {
                        name: '-- -- -- -- -- YES! Is food available?',
                        func: (pct) => seededRand(pct.physicalElem.seed, 0.0, 1.0)[1] > 0.3,
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
                            name: "wants to eat but there's no food here!",
                            verbalize: true,
                            func: (pct) => pctUseConds(pct,
                                {
                                    behavior: 'idling',

                                    // compute x and y based on given speed and heading to 
                                    //  implement "coasting" behavior
                                    x: pctGetCond(pct, 'x') + pctGetCond(pct, 'speed') *
                                        Math.sin(pctGetCond(pct, 'heading')),
                                    y: pctGetCond(pct, 'y') + pctGetCond(pct, 'speed') *
                                        Math.cos(pctGetCond(pct, 'heading')),
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
                            name: '-- -- -- -- -- -- NO! Unknown behavior!',
                            func: (pct) => pct
                        }
                    },
                },
            }
        },
        no: {
            name: 'conditions out of limits!',
            verbalize: true,
            func: (pct) => pctUseConds(pct,
                {
                    behavior: 'frozen',
                }),
        }
    },
    no: {
        name: '-- NO! Return given physicalContainerType',
        func: (pct) => pct,
    }
};


// *** Rulebook functions
// general rulebook resolver
// returns physicalContainerType with applied rule node
// $$$$ Concept addition idea: pre-func and post-func?
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