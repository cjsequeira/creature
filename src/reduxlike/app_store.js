'use strict'

// ****** App store definition and methods ******

// *** Our imports
import { clearActionQueue, lockStore, unlockStore, actionDispatchPrivate } from './action_creators.js';
import { applyArgChain } from '../utils.js';



// REFACTOR
export const special_doActionQueue = (_) => ({
    type: 'SPECIAL',
});


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
        // dispatch an array of actions, updating the public store properties each time
        [
            lockStore(),                // lock the store
            actions,                    // dispatch given actions
            special_doActionQueue(),    // dispatch actions in store queue
            clearActionQueue(),         // clear action queue
            unlockStore(),              // unlock the store
        ].forEach(thisAction => {
            this.storeObj = actionDispatchPrivate(this.storeObj)(thisAction)
        });

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
