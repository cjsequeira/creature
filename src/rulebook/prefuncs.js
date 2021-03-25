'use strict'

// ****** Simulation rulebook: pre-functions ******
// Inspired by: https://ericlippert.com/2015/05/11/wizards-and-warriors-part-five/

// *** Our imports
import {
    eventInsert_insertData,
    event_replacePhysType,
} from './event_creators.js';

import {
    EVENT_INSERT_CREATURETYPES,
    EVENT_INSERT_FOODTYPES,
    WORLD_TOUCH_DISTANCE,
} from '../const_vals.js';

import { compose, partial2, pipeDirect } from '../utils.js';

import {
    getPhysTypeAct,
    getPhysTypeCond,
    getPhysTypeID,
    getPhysTypeStore,
    usePhysTypeConds,
} from '../reduxlike/store_getters.js';

import { physTypeDoPhysics } from '../sim/physics.js';

import {
    randM_chooseWeight,
    randM_genRandM,
    randM_getNextSeed,
    randM_liftBind,
    randM_nextSeed,
    randM_val,
} from '../sim/seeded_rand.js';

import { actAsFood } from '../phystypes/food_type.js';


// *** Rulebook pre-functions
// produce event containing physType with laws of physics applied
// the function application below INCLUDES wall collision testing!
// preFunc signature is (storeType, randM_eventType) => randM_eventType
export const preFuncApplyPhysics = (storeType, randM_eventType) =>
    // total signature: (randM_eventType) => randM_eventType
    randM_liftBind
        ((eventType) =>
            pipeDirect
                (
                    // the given physType, contained in eventType
                    eventType.physType,
                    [
                        // do laws of physics on physType above, using storeType as argument 1
                        partial2(physTypeDoPhysics, storeType),

                        // create a new event using the resulting physType from above
                        event_replacePhysType,
                    ]
                )
        )
        // apply randM_liftBind to the given randM_eventType to unwrap the contained eventType
        //  for use in the function above
        // the randM_liftBind function then returns a randM_eventType
        (randM_eventType);

// build an event to update the creatureType per the behavior request below
//  which comes from weighted random draw using given desire functions
// this event will be processed by the rest of the rulebook, which will return
//  an action based on the rulebook and current app state
// the rulebook may assign the requested behavior, 
//  or may reject the requested behavior and assign a different behavior,
//  or may return an action totally unrelated to the creatureType object below!
// preFunc signature is (storeType, randM_eventType) => randM_eventType
export const preFuncGenBehaviorRequest = (_, randM_eventType) =>
    // generate an updated randM_eventType
    randM_genRandM
        (
            // randM_genRandM value: an eventType
            // create a new event using...
            event_replacePhysType
                (
                    // ...an object based on the given physType...
                    usePhysTypeConds
                        (
                            randM_val(randM_eventType).physType,

                            // ...with a "behavior_request" prop-obj
                            {
                                behavior_request:
                                    // select behavior request from list of given desire funcs using 
                                    // a weighted random number selector
                                    Object.keys(randM_val(randM_eventType).desireFuncType)
                                    // use a randomly-chosen index to select a behavioral desire
                                    [randM_chooseWeight
                                        (
                                            // list of numerical desires
                                            // the code below maps each desire function to a 
                                            //  numerical weight by evaluating it using the 
                                            //  given physType
                                            Object.values(randM_val(randM_eventType).desireFuncType)
                                                .map(f => f(randM_val(randM_eventType).physType)),

                                            // seed for randM_chooseWeight
                                            randM_nextSeed(randM_eventType)
                                        )
                                    ]
                            }
                        )
                ),

            // randM_genRandM seed
            // since we just used a system seed for randM_chooseWeight, 
            //  we must point to the next seed when assembling an updated randM_eventType
            randM_getNextSeed(randM_nextSeed(randM_eventType), 0)
        );

// tag simple creatures touched by creature by bundling them into the given randM_eventType
// REFACTOR: to tag in creatures that a creature will "pass through" between this timestep and the next!
// That would enable tagging of creatures even when a creature is moving very quickly
// preFunc signature is (storeType, randM_eventType) => randM_eventType
export const preFuncTagTouchedCreatures = (storeType, randM_eventType) =>
    // total signature: (randM_eventType) => randM_eventType
    randM_liftBind
        // signature of this function: (eventType) => eventType
        // randM_liftBind lifts the function to signature (eventType) => randM_eventType
        //  then binds it to signature (randM_eventType) => randM_eventType
        ((eventType) =>
            eventInsert_insertData
                (
                    // insert data into the given eventType
                    eventType,

                    // type of data to insert: creatureType
                    EVENT_INSERT_CREATURETYPES,

                    // data to insert: creatureTypes closer than a given distance from this creatureType
                    // get physType store
                    getPhysTypeStore(storeType)
                        // keep only objects other than the self!
                        .filter(
                            (ptToTest1) => getPhysTypeID(ptToTest1) !== getPhysTypeID(eventType.physType)
                        )

                        // keep only creatureTypes...
                        .filter(
                            (ptToTest1) => getPhysTypeCond(ptToTest1, 'behavior') !== undefined
                        )

                        // ...closer than a given distance from this creatureType
                        // REFACTOR into own distance function
                        .filter((ptToTest2) => Math.sqrt(
                            Math.pow(getPhysTypeCond(ptToTest2, 'x') -
                                getPhysTypeCond(eventType.physType, 'x'), 2.0) +
                            Math.pow(getPhysTypeCond(ptToTest2, 'y') -
                                getPhysTypeCond(eventType.physType, 'y'), 2.0)
                        ) < WORLD_TOUCH_DISTANCE)
                )
        )
        // apply randM_liftBind to the given randM_eventType to unwrap the contained eventType
        //  for use in the function above
        // the randM_liftBind function then returns a randM_eventType
        (randM_eventType);

// tag food touched by creature by bundling it into the given randM_eventType
// REFACTOR: to tag in food that a creature will "pass through" between this timestep and the next!
// That would enable tagging of food even when a creature is moving very quickly
// preFunc signature is (storeType, randM_eventType) => randM_eventType
export const preFuncTagTouchedFood = (storeType, randM_eventType) =>
    // total signature: (randM_eventType) => randM_eventType
    randM_liftBind
        // signature of this function: (eventType) => eventType
        // randM_liftBind lifts the function to signature (eventType) => randM_eventType
        //  then binds it to signature (randM_eventType) => randM_eventType
        ((eventType) =>
            eventInsert_insertData
                (
                    // insert data into the given eventType
                    eventType,

                    // type of data to insert: foodType
                    EVENT_INSERT_FOODTYPES,

                    // data to insert: foodTypes closer than a given distance from this creatureType
                    // get physType store
                    getPhysTypeStore(storeType)
                        // keep only food
                        .filter(
                            (ptToTest1) => getPhysTypeAct(ptToTest1) === actAsFood
                        )

                        // keep only food closer than a given distance from this creatureType
                        // REFACTOR into own distance function
                        .filter((ptToTest2) => Math.sqrt(
                            Math.pow(getPhysTypeCond(ptToTest2, 'x') -
                                getPhysTypeCond(eventType.physType, 'x'), 2.0) +
                            Math.pow(getPhysTypeCond(ptToTest2, 'y') -
                                getPhysTypeCond(eventType.physType, 'y'), 2.0)
                        ) < WORLD_TOUCH_DISTANCE)
                )
        )
        // apply randM_liftBind to the given randM_eventType to unwrap the contained eventType
        //  for use in the function above
        // the randM_liftBind function then returns a randM_eventType
        (randM_eventType);
