'use strict'

// *** Reducer for remainder properties of storeType

// *** Our imports
import {
    ACTION_COMPARE_COMPARE_PHYSTYPE,
    ACTION_COMPARE_LOG_CHANGED_BEHAVIORS,
    ACTION_COMPARE_SAVE_PHYSTYPE,
    ACTION_COMPARE_STOP_IF_FROZEN,
    ACTION_DO_NOTHING,
    ACTION_JOURNAL_ADD_ENTRY,
} from '../const_vals.js';

import {
    getJournal,
    getPhysTypeStore,
    getPassedComparePhysTypeStore,
    getSavedPhysTypeStore,
    getPhysTypeCond,
    getSimCurTime,
    getPhysTypeName,
    getPhysTypeAct,
} from './store_getters.js';

import { actAsSimpleCreature } from '../phystypes/simple_creature.js';


// *** Creature behavior strings
// REFACTOR
const behaviorStrings = {
    idling: "is chillin'! Yeeeah...",
    eating: "is eating!! Nom...",
    sleeping: "is sleeping! Zzzz...",
    wandering: "is wandering! Wiggity whack!",
    frozen: "is frozen! Brrrr....."
};


// *** Remainder reducer 
// reducer for "remainder" property of storeType
// takes:
//  inStoreType: store to use as template for reduction, as storeType 
//  inActionType: action to use for reduction, as actionType
// returns storeType "remainder" property object
export const remainderReducer = (inStoreType) => (inActionType) =>
    // list of "mini" reducer functions
    // each function is associated with an action type, given in brackets
    ({
        [ACTION_COMPARE_COMPARE_PHYSTYPE]: (storeType) => (actionType) =>
        ({
            ...storeType.remainder,

            // use current physTypeStore as the master list for comparing against
            //  saved physTypeStore, using the given comparison function
            //  and comparing ID by ID
            passedComparePhysTypeStore: getPhysTypeStore(storeType)
                // get array of current physTypes that pass the selection function
                // selectFunc signature is (physType) => bool
                .filter((ptToTest) => actionType.selectFunc(ptToTest))

                // with array of selected current physTypes, get array of
                //  current PhysTypes that pass the comparison function
                //  against the saved physTypes,
                //  as compared on an ID by ID basis!
                .filter((ptToCompare) =>
                    // compareFunc signature is (old physType) => (new physType) => bool 
                    actionType.compareFunc
                        // saved physType to compare against current
                        (
                            getSavedPhysTypeStore(storeType)
                                // find the saved physType with the same ID as the physType
                                // currently under comparison
                                .find((ptToFind) => ptToFind.id === ptToCompare.id)
                        )
                        // current physType to compare against saved
                        (ptToCompare)
                ),
        }),

        [ACTION_COMPARE_LOG_CHANGED_BEHAVIORS]: (storeType) => (_) =>
        ({
            ...storeType.remainder,
            journal: [
                ...getJournal(storeType),

                ...getPassedComparePhysTypeStore(storeType).map(
                    (physType) => ({
                        timeFloatType: getSimCurTime(storeType),
                        msgStringType: getPhysTypeName(physType) +
                            ' ' + behaviorStrings[getPhysTypeCond(physType)('behavior')],
                    })
                ),
            ]
        }),

        [ACTION_COMPARE_SAVE_PHYSTYPE]: (storeType) => (_) =>
        ({
            ...storeType.remainder,
            savedPhysTypeStore: getPhysTypeStore(storeType),
        }),

        [ACTION_COMPARE_STOP_IF_FROZEN]: (storeType) => (_) =>
        ({
            ...storeType.remainder,
            journal: [
                ...getJournal(storeType),

                ...getPhysTypeStore(storeType)
                    // filter physType store to find simple creatures
                    .filter((ptToTest1) => getPhysTypeAct(ptToTest1) === actAsSimpleCreature)

                    // filter to find simple creatures with behavior of 'frozen'
                    .filter((ptToTest2) => getPhysTypeCond(ptToTest2)('behavior') === 'frozen')

                    // map filter results to journal entries
                    .map(
                        (ptToMap) => ({
                            timeFloatType: getSimCurTime(storeType),
                            msgStringType: getPhysTypeName(ptToMap) + ' is frozen; stopping sim',
                        })
                    )
            ]
        }),

        [ACTION_DO_NOTHING]: (storeType) => (_) => ({ ...storeType.remainder }),

        [ACTION_JOURNAL_ADD_ENTRY]: (storeType) => (actionType) =>
        ({
            ...storeType.remainder,
            journal: [
                ...getJournal(storeType),
                {
                    timeFloatType: getSimCurTime(storeType),
                    msgStringType: actionType.msgStringType,
                }
            ],
        }),

        // use inActionType.type as an entry key into the key-val list above
        // key is used to select a function that takes a storeType object  
        //  and actionType and returns a storeType "remainder" prop obj
        // if no key-val matches the entry key, return a func that echoes 
        //  the given storeType "remainder" property object
    }[inActionType.type] || ((storeType) => (_) => ({ ...storeType.remainder })))
        // evaluate the function with the storeType "remainder" property object 
        //  and actionType to get a storeType "remainder" property object
        (inStoreType)
        (inActionType);
