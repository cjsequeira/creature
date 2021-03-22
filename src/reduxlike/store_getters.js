'use strict'

// ****** Functions to get information from store and generate store info

// REFACTOR idea: For funcs using storeType or physType as first argument, keep as nested arrows
// These funcs are composed in several places.
// Other funcs: remove nested arrows?

import { WATCHPROP_CHANGESPROP } from '../const_vals.js';
import { watchProps } from './watch_props.js';


// *** physType info gen functions
// generate available ID based on IDs already in use
// takes: 
//  storeType
//  proposedIDIntType: initial ID to check for availability, as int
// returns int
export const genPhysTypeAvailID = (storeType) => (proposedIDIntType) =>
    // is there a physType that already has the given ID?
    (getPhysTypeStore(storeType)
        .filter((ptToTest) => getPhysTypeID(ptToTest) === proposedIDIntType)
        .length > 0)
        // yes: increment the ID by one and check that
        ? genPhysTypeAvailID(storeType)(proposedIDIntType + 1)

        // no: send the given ID back to be used
        : proposedIDIntType


// *** physType getter functions
// did given prop in given physType change?
// takes:
//  physType: physType to use
//  propStringType: string name for prop to check - could be a nested prop, with '.'
// returns bool
export const didPhysTypePropChange = (beforePhysType) => (afterPhysType) => (propStringType) =>
    (
        watchProps                          // get obj with watchprops added
            (beforePhysType)
            (afterPhysType)
            (propStringType)
        [WATCHPROP_CHANGESPROP]             // select watchprops sub-object
        [propStringType]                    // select specific watchprop
    ) || false;                             // if watchprop is undefined, return 'false'

// get "passed comparison" physType store
// takes: 
//  storeType: store, as storeType
// returns array of physType objects
export const getPassedComparePhysTypeStore = (storeType) => storeType.remainder.passedComparePhysTypeStore;

// get physType act
// takes:
//  physType: physType to use
// returns act (expected to be a function)
export const getPhysTypeAct = (physType) => physType.act;

// get time elapsed since behavior clock last touched
// takes:
//  storeType: the store to use
//  physType: physType to use
// returns float
export const getPhysTypeBCElapsed = (storeType) => (physType) =>
    getSimCurTime(storeType) - getPhysTypeCond(physType)('behavior_clock');

// get specific condition from physType
// takes:
//  physType: physType to use
//  argCond: string name for key of condition to look at
// returns condition value
export const getPhysTypeCond = (physType) => (argCond) => physType.conds[argCond];

// get conds object from physType
// takes:
//  physType: physType to use
// returns conds object
export const getPhysTypeCondsObj = (physType) => physType.conds;

// get physType color
// takes:
//  physType: physType to use
// returns color value, as string
export const getPhysTypeColor = (physType) => physType.color;

// get physType ID
// takes:
//  physType: physType to use
// returns ID value, as integer
export const getPhysTypeID = (physType) => physType.id;

// get physType name
// takes:
//  physType: physType to use
// returns name, as string
export const getPhysTypeName = (physType) => physType.name;

// get key value from physType
// takes:
//  physType: physType to use
//  argStringType: string name for key of physType to look at
// returns key value
export const getPhysTypeRootKey = (physType) => (argStringType) => physType[argStringType];

// get physType store
// takes: 
//  storeType: store, as storeType
// returns array of physType objects
export const getPhysTypeStore = (storeType) => storeType.physTypeStore;

// get index into physTypeStore for the given physType
// assumes only one physType in the physTypeStore has the ID of the given physType
// takes:
//  storeType
//  physType
// returns int, which would be -1 if physType not found in store
export const getPhysTypeIndex = (storeType) => (physType) =>
    getPhysTypeStore(storeType).findIndex(
        (ptToTest) => getPhysTypeID(ptToTest) === getPhysTypeID(physType)
    );

// get saved physType store
// takes: 
//  storeType: store, as storeType
// returns array of physType objects
export const getSavedPhysTypeStore = (storeType) => storeType.remainder.savedPhysTypeStore;


// *** physType "use" functions
// REFACTOR: Keep as arrow func: often composed!
// use given conditions to make a physType
// takes:
//  physType: physType to use
//  argConds: list of conditions to include, as ...{key, value}
// returns physType
export const usePhysTypeConds = (physType) => (argConds) => ({
    ...physType,
    conds: {
        ...physType.conds,
        ...argConds
    }
});


// *** Simulator getter functions
// return current simulator time
// takes: 
//  storeType: store, as storeType
// returns number
export const getSimCurTime = (storeType) => storeType.sim.curTime;

// return simulator running status
// takes: 
//  storeType: store, as storeType
// returns bool
export const getSimRunning = (storeType) => storeType.sim.running;

// return simulator seed
// takes: 
//  storeType: store, as storeType
// returns number
export const getSimSeed = (storeType) => storeType.sim.seed;

// return simulator timestep
// takes: 
//  storeType: store, as storeType
// returns number
export const getSimTimeStep = (storeType) => storeType.sim.timeStep;


// *** Unsorted getters
// get changes list
// takes:
//  storeType: store, as storeType
//  subStringType: string name for substore to get changes list of, e.g. 'ui'
export const getChangesList = (storeType) => (subStringType) =>
    storeType[subStringType].changesList;

// get journal
// takes: 
//  storeType: store, as storeType
// returns journalType
export const getJournal = (storeType) => storeType.remainder.journal;

// get UI property val
// takes:
//  storeType: store, as storeType
//  argStringType: string name for prop of store UI object to look at
// returns value, as any
export const getUIProp = (storeType) => (argStringType) => storeType.ui[argStringType];

// given object name found in UI changes list?
// takes:
//  storeType: store, as storeType
//  subStringType: string name for substore to investigate, e.g. 'ui'
//  argStringType: string name for object to investigate
export const isObjChanged = (storeType) => (subStringType) => (argStringType) =>
    // is given object name in the changes list?
    (storeType[subStringType].changesList.find((objName) => objName === argStringType)
        !== undefined)
        // in changes list: return true
        ? true

        // not in changes list: return false
        : false
