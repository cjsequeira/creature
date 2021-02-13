'use strict'

// ****** Simulation rulebook ******
// Inspired by: https://ericlippert.com/2015/05/11/wizards-and-warriors-part-five/

// *** Our imports
import { seededRand, withinRange } from './util.js';


// *** The rulebook
const ruleBook = {
    name: 'Is creatureType?',
    func: (physicalType) => physicalType.hasOwnProperty('conds'),
    yes: {
        name: '-- YES! Glucose and neuro in range?',
        func: (creatureType) => ((creatureType.conds.glucose > 0.0) &&
            (creatureType.conds.neuro < 100.0)),
        yes: {
            name: '-- -- YES! Requesting behavior: idling?',
            func: (creatureType) => creatureType.conds.behavior_request === 'idling',
            yes: {
                name: '-- -- -- YES! Behavior request approved: idling',
                func: (creatureType) => ({
                    ...creatureType,
                    conds: {
                        ...creatureType.conds,
                        behavior: creatureType.conds.behavior_request,

                        // can't idle and wander!
                        speed: 0.0
                    }
                })
            },
            no: {
                name: '-- -- -- NO! Requesting behavior: wandering?',
                func: (creatureType) => creatureType.conds.behavior_request === 'wandering',
                yes: {
                    name: '-- -- -- -- YES! Projected position in range?',
                    func: (creatureType) =>
                        withinRange(creatureType.conds.x +
                            creatureType.conds.speed *
                            Math.sin(creatureType.conds.heading),
                            0.0,
                            20.0) &&
                        withinRange(creatureType.conds.y +
                            creatureType.conds.speed *
                            Math.cos(creatureType.conds.heading),
                            0.0,
                            20.0),
                    yes: {
                        name: '-- -- -- -- -- YES! Behavior request approved: wandering',
                        func: (creatureType) => ({
                            ...creatureType,
                            conds: {
                                ...creatureType.conds,
                                behavior: creatureType.conds.behavior_request,

                                // compute x and y based on given speed and heading 
                                x: creatureType.conds.x +
                                    creatureType.conds.speed *
                                    Math.sin(creatureType.conds.heading),
                                y: creatureType.conds.y +
                                    creatureType.conds.speed *
                                    Math.cos(creatureType.conds.heading),

                                // compute speed based on given accel
                                speed: creatureType.conds.speed + creatureType.conds.accel,
                            }
                        })
                    },
                    no: {
                        name: '-- -- -- -- -- NO! MUTHAFUKKA BOUNCED!',
                        func: (creatureType) => ({
                            ...creatureType,
                            conds: {
                                ...creatureType.conds,
                                behavior: creatureType.conds.behavior_request,

                                // compute x and y based on REVERSE of given speed and heading 
                                x: creatureType.conds.x -
                                    creatureType.conds.speed *
                                    Math.sin(creatureType.conds.heading),
                                y: creatureType.conds.y -
                                    creatureType.conds.speed *
                                    Math.cos(creatureType.conds.heading),

                                // spin heading around a bit (in radians)
                                heading: creatureType.conds.heading + 2.0
                            }
                        })
                    }
                },
                no: {
                    name: '-- -- -- -- NO! Requesting behavior: eating?',
                    func: (creatureType) => creatureType.conds.behavior_request === 'eating',
                    yes: {
                        name: '-- -- -- -- -- YES! Is food available?',
                        func: (creatureType) => seededRand(creatureType.seed, 0.0, 1.0)[1] > 0.2,
                        yes: {
                            name: '-- -- -- -- -- -- YES! Behavior request approved: eating',
                            func: (creatureType) => ({
                                ...creatureType,
                                seed: seededRand(creatureType.seed, 0.0, 1.0)[0],
                                conds: {
                                    ...creatureType.conds,
                                    behavior: creatureType.conds.behavior_request,

                                    // can't move if eating: no grab-and-go!
                                    speed: 0.0
                                }
                            })
                        },
                        no: {
                            name: '-- -- -- -- -- -- NO! Behavior set to: idling',
                            func: (creatureType) => ({
                                ...creatureType,
                                seed: seededRand(creatureType.seed, 0.0, 1.0)[0],
                                conds: {
                                    ...creatureType.conds,
                                    behavior: 'idling',

                                    // can't idle and wander!
                                    speed: 0.0
                                }
                            })
                        }
                    },
                    no: {
                        name: '-- -- -- -- -- NO! Requested behavior: sleeping?',
                        func: (creatureType) => creatureType.conds.behavior_request === 'sleeping',
                        yes: {
                            name: '-- -- -- -- -- -- YES! Behavior request approved',
                            func: (creatureType) => ({
                                ...creatureType,
                                conds: {
                                    ...creatureType.conds,
                                    behavior: creatureType.conds.behavior_request,

                                    // can't move if sleeping!
                                    speed: 0.0,
                                }
                            })
                        },
                        no: {
                            name: '-- -- -- -- -- NO! Unknown behavior!',
                            func: (creatureType) => creatureType
                        }
                    },
                },
            }
        },
        no: {
            name: '-- -- NO! Behavior set to: frozen',
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
        name: '-- NO! Return given physicalType',
        func: (physicalType) => physicalType
    }
};


// *** Rulebook functions
// general rulebook resolver
// returns physicalType
export const ResolveRules = (arg = {}, node = ruleBook) => {
//    console.log(node.name);
    const funcResult = node.func(arg);

    switch (funcResult) {
        case true: return ResolveRules(arg, node.yes);
        case false: return ResolveRules(arg, node.no);
        default: return funcResult;
    }
};