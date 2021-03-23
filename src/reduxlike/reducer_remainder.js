'use strict'

// *** Reducer for remainder properties of storeType

// *** Our imports
import {
    getChangesList,
    getJournal,
    getSimCurTime,
} from './store_getters.js';

import {
    ACTION_DO_NOTHING,
    ACTION_FORCE_CHANGES_LIST_UPDATE,
    ACTION_JOURNAL_ADD_ENTRY,
} from '../const_vals.js';


// *** Remainder reducer mini reducer functions
const remRed_actionDoNothing_func = (storeType, _) =>
    ({ ...storeType.remainder });

const remRed_actionForceChangesListUpdate_func = (storeType, actionType) =>
({
    ...storeType.remainder,

    changesList:
        // is the target substore this one?
        (actionType.subStringType === 'remainder')
            // yes: add the given object name to the changes list
            ? [
                ...getChangesList(storeType)('remainder'),
                actionType.objStringType,
            ]

            // no: keep the changes list the same
            : getChangesList(storeType)('remainder'),
});

const remRed_actionJournalAddEntry_func = (storeType, actionType) =>
({
    ...storeType.remainder,

    changesList: [
        ...getChangesList(storeType)('remainder'),
        'journal',
    ],

    journal: [
        ...getJournal(storeType),
        {
            timeFloatType: getSimCurTime(storeType),
            msgStringType: actionType.msgStringType,
        }
    ],
});

const remRed_default_func = (storeType, _) =>
    ({ ...storeType.remainder });


// *** Remainder reducer main function
// reducer for "remainder" property of storeType
// takes:
//  inStoreType: store to use as template for reduction, as storeType 
//  inActionType: action to use for reduction, as actionType
// returns storeType "remainder" property object
export const remainderReducer = (inStoreType, inActionType) =>
    // list of "mini" reducer functions
    // each function is associated with an action type, given in brackets
    ({
        [ACTION_DO_NOTHING]: remRed_actionDoNothing_func,

        [ACTION_FORCE_CHANGES_LIST_UPDATE]: remRed_actionForceChangesListUpdate_func,

        [ACTION_JOURNAL_ADD_ENTRY]: remRed_actionJournalAddEntry_func,

        // use inActionType.type as an entry key into the key-val list above
        // key is used to select a function that takes a storeType object  
        //  and actionType and returns a storeType "remainder" prop obj
        // if no key-val matches the entry key, return a func that echoes 
        //  the given storeType "remainder" property object
    }[inActionType.type] || remRed_default_func)
        // evaluate the function with the storeType "remainder" property object 
        //  and actionType to get a storeType "remainder" property object
        (inStoreType, inActionType);
