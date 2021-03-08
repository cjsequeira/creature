'use strict'

// ****** App store definition and methods ******

// *** Our imports
import {
    lockStore,
    unlockStore,
    storeTypeTemplate,
} from './action_creators.js';

import { combineReducers } from './reduxlike_utils.js';


// *** Global app store
export var appStore = {
    // initial action queue
    actionQueue: [],

    // initial "public" store properties, as storeType
    storeObj: {},

    // *** Functions to be set by user
    // function to be called after action dispatch is completed
    subscribedFunc: function () { },

    // *** Public action dispatch function
    // takes:
    //  storeType: app store, as storeType
    //  ...actions: action creators to apply, each returning actionType
    // returns storeType
    actionDispatch: function (...actions) {
        // push a series of actions into the action queue
        this.actionQueue.push(
            ...[
                lockStore(),                // lock the store
                actions,                    // include given actions
                unlockStore(),              // unlock the store
            ].flat(Infinity)                // flatten the entire series
        );

        // now dispatch whatever is in the action queue in FIFO order, which could 
        //  be MORE THAN THE ACTIONS WE JUST PUSHED!
        // for each action dispatched, update the public store properties
        while (this.actionQueue.length > 0) {
            this.storeObj = combineReducers
                (storeTypeTemplate)
                (appStore.storeObj)
                (this.actionQueue.shift());
        }

        // call subscribed func
        this.subscribedFunc();
    },

    // *** Setters
    // set function to call when app store changes
    // takes:
    //  inFunc: () => ()
    // returns undefined
    setSubScribedFunc: function (inFunc) {
        this.subscribedFunc = inFunc;
    },
}
