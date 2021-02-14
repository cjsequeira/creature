'use strict'

// ****** Simulation rulebook ******
// Inspired by: https://ericlippert.com/2015/05/11/wizards-and-warriors-part-five/

// *** Our imports
import { seededRand, withinRange } from './util.js';


// *** String constants for rules that will be verbally expressed elsewhere
export const RULE_HIT_WALL = 'hit a wall! BOUNCE...';
export const RULE_CONDS_OUT_OF_LIMITS = 'conditions out of limits!';


// *** The rulebook
const ruleBook = {
    name: 'Is creatureType?',
    func: (physicalContainerType) =>
        physicalContainerType.physicalElem.hasOwnProperty('conds'),
    yes: {
        name: '-- YES! Glucose and neuro in range?',
        func: (physicalContainerType) =>
        ((physicalContainerType.physicalElem.conds.glucose > 0.0) &&
            (physicalContainerType.physicalElem.conds.neuro < 100.0)),
        yes: {
            name: '-- -- YES! Requesting behavior: idling?',
            func: (physicalContainerType) =>
                physicalContainerType.physicalElem.conds.behavior_request === 'idling',
            yes: {
                name: '-- -- -- YES! Behavior request approved: idling',
                func: (physicalContainerType) => ({
                    ...physicalContainerType,
                    physicalElem: {
                        ...physicalContainerType.physicalElem,
                        conds: {
                            ...physicalContainerType.physicalElem.conds,
                            behavior: physicalContainerType.physicalElem.conds.behavior_request,

                            // can't idle and wander!
                            speed: 0.0
                        }
                    }
                })
            },
            no: {
                name: '-- -- -- NO! Requesting behavior: wandering?',
                func: (physicalContainerType) =>
                    physicalContainerType.physicalElem.conds.behavior_request === 'wandering',
                yes: {
                    name: '-- -- -- -- YES! Projected position in range?',
                    func: (physicalContainerType) =>
                        withinRange(physicalContainerType.physicalElem.conds.x +
                            physicalContainerType.physicalElem.conds.speed *
                            Math.sin(physicalContainerType.physicalElem.conds.heading),
                            0.0,
                            20.0) &&
                        withinRange(physicalContainerType.physicalElem.conds.y +
                            physicalContainerType.physicalElem.conds.speed *
                            Math.cos(physicalContainerType.physicalElem.conds.heading),
                            0.0,
                            20.0),
                    yes: {
                        name: '-- -- -- -- -- YES! Behavior request approved: wandering',
                        func: (physicalContainerType) => ({
                            ...physicalContainerType,
                            physicalElem: {
                                ...physicalContainerType.physicalElem,
                                conds: {
                                    ...physicalContainerType.physicalElem.conds,
                                    behavior: physicalContainerType.physicalElem.conds.behavior_request,

                                    // compute x and y based on given speed and heading 
                                    x: physicalContainerType.physicalElem.conds.x +
                                        physicalContainerType.physicalElem.conds.speed *
                                        Math.sin(physicalContainerType.physicalElem.conds.heading),
                                    y: physicalContainerType.physicalElem.conds.y +
                                        physicalContainerType.physicalElem.conds.speed *
                                        Math.cos(physicalContainerType.physicalElem.conds.heading),

                                    // compute speed based on given accel
                                    speed: physicalContainerType.physicalElem.conds.speed +
                                        physicalContainerType.physicalElem.conds.accel,
                                }
                            }
                        })
                    },
                    no: {
                        name: RULE_HIT_WALL,
                        func: (physicalContainerType) => ({
                            ...physicalContainerType,
                            physicalElem: {
                                ...physicalContainerType.physicalElem,
                                conds: {
                                    ...physicalContainerType.physicalElem.conds,
                                    behavior: physicalContainerType.physicalElem.conds.behavior_request,

                                    // compute x and y based on REVERSE of given speed and heading 
                                    x: physicalContainerType.physicalElem.conds.x -
                                        physicalContainerType.physicalElem.conds.speed *
                                        Math.sin(physicalContainerType.physicalElem.conds.heading),
                                    y: physicalContainerType.physicalElem.conds.y -
                                        physicalContainerType.physicalElem.conds.speed *
                                        Math.cos(physicalContainerType.physicalElem.conds.heading),

                                    // spin heading around a bit (in radians)
                                    heading: physicalContainerType.physicalElem.conds.heading + 2.0
                                }
                            }
                        })
                    }
                },
                no: {
                    name: '-- -- -- -- NO! Requesting behavior: eating?',
                    func: (physicalContainerType) =>
                        physicalContainerType.physicalElem.conds.behavior_request === 'eating',
                    yes: {
                        name: '-- -- -- -- -- YES! Is food available?',
                        func: (physicalContainerType) =>
                            seededRand(physicalContainerType.physicalElem.seed, 0.0, 1.0)[1] > 0.2,
                        yes: {
                            name: '-- -- -- -- -- -- YES! Behavior request approved: eating',
                            func: (physicalContainerType) => ({
                                ...physicalContainerType,
                                physicalElem: {
                                    ...physicalContainerType.physicalElem,
                                    seed: seededRand(physicalContainerType.physicalElem.seed, 0.0, 1.0)[0],
                                    conds: {
                                        ...physicalContainerType.physicalElem.conds,
                                        behavior: physicalContainerType.physicalElem.conds.behavior_request,

                                        // can't move if eating: no grab-and-go!
                                        speed: 0.0
                                    }
                                }
                            })
                        },
                        no: {
                            name: '-- -- -- -- -- -- NO! Behavior set to: idling',
                            func: (physicalContainerType) => ({
                                ...physicalContainerType,
                                physicalElem: {
                                    ...physicalContainerType.physicalElem,
                                    seed: seededRand(physicalContainerType.physicalElem.seed, 0.0, 1.0)[0],
                                    conds: {
                                        ...physicalContainerType.physicalElem.conds,
                                        behavior: 'idling',

                                        // can't idle and wander!
                                        speed: 0.0
                                    }
                                }
                            })
                        }
                    },
                    no: {
                        name: '-- -- -- -- -- NO! Requested behavior: sleeping?',
                        func: (physicalContainerType) =>
                            physicalContainerType.physicalElem.conds.behavior_request === 'sleeping',
                        yes: {
                            name: '-- -- -- -- -- -- YES! Behavior request approved',
                            func: (physicalContainerType) => ({
                                ...physicalContainerType,
                                physicalElem: {
                                    ...physicalContainerType.physicalElem,
                                    conds: {
                                        ...physicalContainerType.physicalElem.conds,
                                        behavior: physicalContainerType.physicalElem.conds.behavior_request,

                                        // can't move if sleeping!
                                        speed: 0.0,
                                    }
                                }
                            })
                        },
                        no: {
                            name: '-- -- -- -- -- NO! Unknown behavior!',
                            func: (physicalContainerType) => physicalContainerType
                        }
                    },
                },
            }
        },
        no: {
            name: RULE_CONDS_OUT_OF_LIMITS,
            func: (physicalContainerType) => ({
                ...physicalContainerType,
                physicalElem: {
                    ...physicalContainerType.physicalElem,
                    conds: {
                        ...physicalContainerType.physicalElem.conds,
                        behavior: 'frozen'
                    }
                }
            })
        }
    },
    no: {
        name: '-- NO! Return given physicalContainerType',
        func: (physicalContainerType) => physicalContainerType
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