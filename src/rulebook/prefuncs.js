'use strict'

// ****** Simulation rulebook: pre-functions ******
// Inspired by: https://ericlippert.com/2015/05/11/wizards-and-warriors-part-five/

// *** Our imports
import { eventInsert_insertData, event_replacePhysType } from './event_creators.js';
import { compose } from '../utils.js';
import { getPhysTypeAct, getPhysTypeCond, getPhysTypeID, getPhysTypeStore, usePhysTypeConds } from '../reduxlike/store_getters.js';
import { physTypeDoPhysics } from '../sim/physics.js';

import {
    rand_chooseWeight,
    rand_genRandM,
    rand_getNextSeed,
    rand_liftBind,
    rand_nextSeed,
    rand_val,
} from '../sim/seeded_rand.js';
import { EVENT_INSERT_CREATURETYPES, EVENT_INSERT_FOODTYPES, WORLD_TOUCH_DISTANCE } from '../const_vals.js';
import { actAsFood } from '../phystypes/food_type.js';


// *** Rulebook pre-functions
// produce event containing physType with laws of physics applied
// the function application below INCLUDES wall collision testing!
// preFunc signature is (storeType) => (rand_eventType) => rand_eventType
export const preFuncApplyPhysics = (storeType) => (rand_eventType) =>
    rand_genRandM
        // rand_genRandM value
        (
            compose
                // create a new event using...
                (event_replacePhysType)

                // ...a physType with physics applied
                (physTypeDoPhysics(storeType))

                // the physType to apply physics to
                (rand_val(rand_eventType).physType)
        )
        // rand_genRandM seed
        (rand_nextSeed(rand_eventType));

// build an event to update the creatureType per the behavior request below
//  which comes from weighted random draw using given desire functions
// this event will be processed by the rest of the rulebook, which will return
//  an action based on the rulebook and current app state
// the rulebook may assign the requested behavior, 
//  or may reject the requested behavior and assign a different behavior,
//  or may return an action totally unrelated to the creatureType object below!
// preFunc signature is (storeType) => (rand_eventType) => rand_eventType
export const preFuncGenBehaviorRequest = (_) => (rand_eventType) =>
    // generate an updated rand_eventType
    rand_genRandM
        // rand_genRandM value
        (compose
            // create a new event using...
            (event_replacePhysType)

            // ... an object based on the given physType, with a "behavior_request" prop-obj
            (usePhysTypeConds(rand_val(rand_eventType).physType))

            // here is the "behavior_request" prop-obj
            ({
                behavior_request:
                    // select behavior request from list of given desire funcs using 
                    // a weighted random number selector
                    Object.keys(rand_val(rand_eventType).desireFuncType)
                    // use a randomly-chosen index to select a behavioral desire
                    [rand_chooseWeight
                        // list of numerical desires
                        (
                            // the code below maps each desire function to a numerical weight
                            //  by evaluating it using the given physType
                            Object.values(rand_val(rand_eventType).desireFuncType)
                                .map(f => f(rand_val(rand_eventType).physType))
                        )
                        // seed for rand_chooseWeight
                        (rand_nextSeed(rand_eventType))
                    ]
            })
        )
        // rand_genRandM seed
        // since we just used a system seed for rand_chooseWeight, 
        //  we must point to the next seed when assembling an updated rand_eventType
        (rand_getNextSeed(rand_nextSeed(rand_eventType))(0));

// tag simple creatures touched by creature by bundling them into the given rand_eventType
export const preFuncTagTouchedCreatures = (storeType) => (rand_eventType) =>
    // total signature: (rand_eventType) => rand_eventType
    rand_liftBind
        // signature of this function: (eventType) => eventType
        // rand_liftBind lifts the function to signature (eventType) => rand_eventType
        //  then binds it to signature (rand_eventType) => rand_eventType
        ((eventType) =>
            // insert data into the given eventType
            eventInsert_insertData(eventType)
                // type of data to insert: creatureType
                (EVENT_INSERT_CREATURETYPES)

                // data to insert: creatureTypes closer than a given distance from this creatureType
                (
                    // get physType store
                    getPhysTypeStore(storeType)
                        // keep only objects other than the self!
                        .filter(
                            (ptToTest1) => getPhysTypeID(ptToTest1) !== getPhysTypeID(eventType.physType)
                        )

                        // keep only creatureTypes...
                        .filter(
                            (ptToTest1) => getPhysTypeCond(ptToTest1)('behavior') !== undefined
                        )

                        // ...closer than a given distance from this creatureType
                        .filter((ptToTest2) => Math.sqrt(
                            Math.pow(getPhysTypeCond(ptToTest2)('x') -
                                getPhysTypeCond(eventType.physType)('x'), 2.0) +
                            Math.pow(getPhysTypeCond(ptToTest2)('y') -
                                getPhysTypeCond(eventType.physType)('y'), 2.0)
                        ) < WORLD_TOUCH_DISTANCE)
                )
        )
        // apply rand_liftBind to the given rand_eventType to unwrap the contained eventType
        //  for use in the function above
        // the rand_liftBind function then returns a rand_eventType
        (rand_eventType);

// tag food touched by creature by bundling it into the given rand_eventType
export const preFuncTagTouchedFood = (storeType) => (rand_eventType) =>
    // total signature: (rand_eventType) => rand_eventType
    rand_liftBind
        // signature of this function: (eventType) => eventType
        // rand_liftBind lifts the function to signature (eventType) => rand_eventType
        //  then binds it to signature (rand_eventType) => rand_eventType
        ((eventType) =>
            // insert data into the given eventType
            eventInsert_insertData(eventType)
                // type of data to insert: foodType
                (EVENT_INSERT_FOODTYPES)

                // data to insert: foodTypes closer than a given distance from this creatureType
                (
                    // get physType store
                    getPhysTypeStore(storeType)
                        // keep only food
                        .filter(
                            (ptToTest1) => getPhysTypeAct(ptToTest1) === actAsFood
                        )

                        // keep only food closer than a given distance from this creatureType
                        .filter((ptToTest2) => Math.sqrt(
                            Math.pow(getPhysTypeCond(ptToTest2)('x') -
                                getPhysTypeCond(eventType.physType)('x'), 2.0) +
                            Math.pow(getPhysTypeCond(ptToTest2)('y') -
                                getPhysTypeCond(eventType.physType)('y'), 2.0)
                        ) < WORLD_TOUCH_DISTANCE)
                )
        )
        // apply rand_liftBind to the given rand_eventType to unwrap the contained eventType
        //  for use in the function above
        // the rand_liftBind function then returns a rand_eventType
        (rand_eventType);
