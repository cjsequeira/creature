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
    // *** Internal properties
    // initial action queue
    actionQueue: [],

    // initial "public" store properties, as storeType
    storeObj: {},

    // REFACTOR: LINK UP QUEUEING AND DISPATCHING AGAIN!

    // *** Methods: Action handling
    // push actions to the action queue, then process the entire queue
    // takes:
    //  ...actions: actions to queue, as actionType
    // returns undefined
    dispatchActions: function (...actions) {
        // push the actions into the action queue
        this.actionQueue.push(...actions.flat(Infinity));

        // process whatever is in the action queue in FIFO order
        // the queue may contain MORE THAN THE GIVEN ACTIONS!!
        // for EACH action dispatched, update the public store properties
        while (this.actionQueue.length > 0) {
            this.storeObj = combineReducers
                (storeTypeTemplate)
                (appStore.storeObj)
                (this.actionQueue.shift());
        }

        // call subscribed func (typically used for rendering UI)
        this.subscribedFunc();
    },


    // *** Methods: Methods to be set by user
    // function to be called after action dispatch is completed
    subscribedFunc: function () { },


    // *** Methods: Setters
    // set function to call when app store changes
    // takes:
    //  inFunc: () => ()
    // returns undefined
    setSubScribedFunc: function (inFunc) {
        this.subscribedFunc = inFunc;
    },
};
