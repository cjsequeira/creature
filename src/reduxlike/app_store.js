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


    // *** Methods: Action handling
    // process all actions in the action queue
    // takes:
    //  don't care
    // returns undefined
    processActionQueue: function (_) {
        // process whatever is in the action queue in FIFO order
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

    // push actions to the queue
    // takes:
    //  ...actions: actions to queue, as actionType
    // returns undefined
    pushActionsToQueue: function (...actions) {
        // push the actions into the action queue
        this.actionQueue.push(...actions.flat(Infinity))
    },


    // *** Getters
    // get specific condition of specific physType in store at given index
    // return specific condition from physType
    // takes:
    //  indexIntType: index into physType store
    //  argCond: string name for key of condition to look at
    // returns condition value
    getPhysTypeCondAtIndex: function (indexIntType, argCond) {
        return this.storeObj.remainder.physTypeStore[indexIntType].conds[argCond];
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
