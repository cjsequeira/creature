'use strict'

// ****** Simulation rulebook: pre-functions ******
// Inspired by: https://ericlippert.com/2015/05/11/wizards-and-warriors-part-five/

// *** Our imports
import { event_replacePhysType } from './event_creators.js';
import { compose } from '../utils.js';
import { usePhysTypeConds } from '../reduxlike/store_getters.js';
import { physTypeDoPhysics } from '../sim/physics.js';

import {
    rand_chooseWeight,
    rand_genRandM,
    rand_getNextSeed,
    rand_nextSeed,
    rand_val,
} from '../sim/seeded_rand.js';


// *** Rulebook pre-functions
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
