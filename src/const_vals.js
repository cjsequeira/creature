'use strict'

// ****** All constant values in the application ******

// *** Action names
// compare: for saving and comparing physTypes
export const ACTION_COMPARE_COMPARE_PHYSTYPE = 'ACTION_COMPARE_COMPARE_PHYSTYPE';
export const ACTION_COMPARE_LOG_CHANGED_BEHAVIORS = 'ACTION_COMPARE_LOG_CHANGED_BEHAVIORS';
export const ACTION_COMPARE_SAVE_PHYSTYPE = 'ACTION_COMPARE_SAVE_PHYSTYPE';
export const ACTION_COMPARE_STOP_IF_FROZEN = 'ACTION_COMPARE_STOP_IF_FROZEN';

// do nothing
export const ACTION_DO_NOTHING = 'ACTION_DO_NOTHING';

// journal: add entry
export const ACTION_JOURNAL_ADD_ENTRY = 'ACTION_JOURNAL_ADD_ENTRY';
 
// physType store actions
export const ACTION_PHYSTYPE_ADD_PHYSTYPE = 'ACTION_PHYSTYPE_ADD_PHYSTYPE';
export const ACTION_PHYSTYPE_DELETE_PHYSTYPE = 'ACTION_PHYSTYPE_DELETE_PHYSTYPE';
export const ACTION_PHYSTYPE_UPDATE_PHYSTYPE = 'ACTION_PHYSTYPE_UPDATE_PHYSTYPE';
export const ACTION_PHYSTYPE_UPDATE_SELECT_PHYSTYPES = 'ACTION_PHYSTYPE_UPDATE_SELECT_PHYSTYPES';

// UI: update data used for UI
export const ACTION_UI_ADD_TIME_CHART_DATA = 'ACTION_UI_ADD_TIME_CHART_DATA';
export const ACTION_UI_ADD_GEO_CHART_DATA = 'ACTION_UI_ADD_GEO_CHART_DATA';
export const ACTION_UI_ADD_STATUS_MESSAGE = 'ACTION_UI_ADD_STATUS_MESSAGE';

// simulator control
export const ACTION_SIM_ADVANCE = 'ACTION_SIM_ADVANCE';
export const ACTION_SIM_SAVE_CLOCK = 'ACTION_SIM_SAVE_CLOCK';
export const ACTION_SIM_START = 'ACTION_SIM_START';
export const ACTION_SIM_STOP = 'ACTION_SIM_STOP';


// *** Event names
export const EVENT_UPDATE_ALL_PHYSTYPES = 'EVENT_UPDATE_ALL_PHYSTYPES';
export const EVENT_UPDATE_CREATURETYPE = 'EVENT_UPDATE_CREATURETYPE';
export const EVENT_UPDATE_PHYSTYPE = 'EVENT_UPDATE_PHYSTYPE';


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


// *** Name for object property updated by watchProps
export const WATCHPROP_CHANGESPROP = '_watchProps_changes';


// *** World constants
// initial number of food items
export const WORLD_NUM_FOOD = 60;

// x and y sizes
export const WORLD_SIZE_X = 20.0;
export const WORLD_SIZE_Y = 20.0;

// distance between physTypes that constitutes a touch
export const WORLD_TOUCH_DISTANCE = 0.75;
