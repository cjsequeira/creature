'use strict'

// ****** All constant values in the application ******

// *** Action names
// perform rendering that may mutate parts of the application beyond the store
export const ACTION_MUTABLE_RENDER = 'MUTABLE_RENDER';

// queue update UI
export const ACTION_QUEUE_ADD_TIME_CHART_DATA = 'QUEUE_ADD_TIME_CHART_DATA';
export const ACTION_QUEUE_ADD_GEO_CHART_DATA = 'QUEUE_ADD_GEO_CHART_DATA';
export const ACTION_QUEUE_ADD_STATUS_MESSAGE = 'QUEUE_ADD_STATUS_MESSAGE';

// add journal entry
export const ACTION_JOURNAL_ADD_ENTRY = 'JOURNAL_ADD_ENTRY';

// do creature action
export const ACTION_PHYSTYPE_DO_ACT = 'PHYSTYPE_DO_ACT';

// control simulator
export const ACTION_SIM_ADVANCE = 'SIM_ADVANCE';
export const ACTION_SIM_SAVE_CLOCK = 'SIM_SAVE_CLOCK';
export const ACTION_SIM_START = 'SIM_START';
export const ACTION_SIM_STOP = 'SIM_STOP';

// control writing to store
export const ACTION_STORE_LOCK = 'STORE_LOCK';
export const ACTION_STORE_UNLOCK = 'STORE_UNLOCK';

// do nothing
export const ACTION_DO_NOTHING = 'DO_NOTHING';


// *** HTML page references 
export const CREATURE_GEO_CHART = 'page_geo_chart';
export const CREATURE_TIME_CHART = 'page_time_chart';
export const CREATURE_STATUS_BOX = 'page_creature_status';


// *** UI
export const UI_NUM_TRAILS = 20;


// *** Update frequencies
// how often (ideally) to update the non-sim and the simulator in milliseconds
// simulator frequency should be MORE FREQUENT than non-sim
export const UPDATE_FREQ_NONSIM = 100.0;
export const UPDATE_FREQ_SIM = 50;


// *** World constants
// x and y sizes
export const WORLD_SIZE_X = 20.0;
export const WORLD_SIZE_Y = 20.0;
