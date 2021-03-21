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

// force changes list update
export const ACTION_FORCE_CHANGES_LIST_UPDATE = 'ACTION_FORCE_CHANGES_LIST_UPDATE';

// journal: add entry
export const ACTION_JOURNAL_ADD_ENTRY = 'ACTION_JOURNAL_ADD_ENTRY';

// physType store actions
export const ACTION_PHYSTYPE_ADD_PHYSTYPE = 'ACTION_PHYSTYPE_ADD_PHYSTYPE';
export const ACTION_PHYSTYPE_DELETE_PHYSTYPE = 'ACTION_PHYSTYPE_DELETE_PHYSTYPE';
export const ACTION_PHYSTYPE_REPLACE_PHYSTYPE = 'ACTION_PHYSTYPE_REPLACE_PHYSTYPE';
export const ACTION_PHYSTYPE_UPDATE_SELECT_PHYSTYPES = 'ACTION_PHYSTYPE_UPDATE_SELECT_PHYSTYPES';
export const ACTION_PHYSTYPE_UPDATE_SELECT_PHYSTYPES_RAND = 'ACTION_PHYSTYPE_UPDATE_SELECT_PHYSTYPES_RAND';

// UI: update data used for UI
export const ACTION_UI_ADD_TIME_CHART_DATA = 'ACTION_UI_ADD_TIME_CHART_DATA';
export const ACTION_UI_ADD_GEO_CHART_DATA = 'ACTION_UI_ADD_GEO_CHART_DATA';
export const ACTION_UI_ADD_STATUS_MESSAGE = 'ACTION_UI_ADD_STATUS_MESSAGE';

// simulator control
export const ACTION_SIM_ADVANCE = 'ACTION_SIM_ADVANCE';
export const ACTION_SIM_INC_SEED = 'ACTION_SIM_INC_SEED';
export const ACTION_SIM_SAVE_CLOCK = 'ACTION_SIM_SAVE_CLOCK';
export const ACTION_SIM_SET_SEED = 'ACTION_SIM_SET_SEED';
export const ACTION_SIM_START = 'ACTION_SIM_START';
export const ACTION_SIM_STOP = 'ACTION_SIM_STOP';


// *** creatureType behavior
export const BEHAVIOR_MIN_TIME = 500.0;
export const BEHAVIOR_ACHING_TIME = 1000.0;
export const BEHAVIOR_EATING_TIME = 1500.0;


// *** Event names
export const EVENT_REPLACE_CREATURETYPE = 'EVENT_REPLACE_CREATURETYPE';
export const EVENT_REPLACE_PHYSTYPE = 'EVENT_REPLACE_PHYSTYPE';
export const EVENT_UPDATE_ALL_PHYSTYPES = 'EVENT_UPDATE_ALL_PHYSTYPES';

// *** Event insert data types
export const EVENT_INSERT_CREATURETYPES = 'EVENT_INSERT_CREATURETYPES';
export const EVENT_INSERT_FOODTYPES = 'EVENT_INSERT_FOODTYPES';


// *** HTML page references 
export const CREATURE_GEO_CHART = 'page_geo_chart';
export const CREATURE_TIME_CHART = 'page_time_chart';
export const CREATURE_STATUS_BOX = 'page_creature_status';


// *** Special datatype names
export const TYPE_RANDM = 'TYPE_RANDM';
export const TYPE_RANDM_OBJ = 'TYPE_RANDM_OBJ';


// *** UI: Creature display info
// behavior colors
export const UI_BEHAVIOR_COLORS = {
    aching: '#ff0000ff',            // hard red
    eating: '#ffdeadff',            // yellow-white
    frozen: '#69beffff',            // ice blue
    idling: '#bbbbbbdd',            // gray
    sleeping: '#0565F9bb',          // deep blue
    wandering: '#0cc421dd',         // light green
};

// behavior strings
export const UI_BEHAVIOR_STRINGS = {
    aching: "is sore! Ooof!",
    eating: "is chewing and eating! Nom nom nom...",
    frozen: "is frozen! Brrrr.....",
    idling: "is chillin'! Yeeeah...",
    sleeping: "is sleeping! Zzzz...",
    wandering: "is wandering! Wiggity whack!",
};

export const UI_BORDER_WIDTH = 5;
export const UI_CREATURE_RADIUS = 7;
export const UI_NUM_TRAILS = 15;
export const UI_OTHER_RADIUS = 3;


// *** Update frequencies
// how often (ideally) to update different application aspects
// simulator frequency should be EQUAL TO OR MORE FREQUENT than non-sim stuff!
export const UPDATE_FREQ_SIM = 20.0;
export const UPDATE_FREQ_TIME_CHART = 1000.0;


// *** Name for object property updated by watchProps
export const WATCHPROP_CHANGESPROP = '_watchProps_changes';


// *** World constants
// initial number of food items
export const WORLD_NUM_FOOD = 100;

// x and y sizes
export const WORLD_SIZE_X = 20.0;
export const WORLD_SIZE_Y = 20.0;

// distance between physTypes that constitutes a touch
export const WORLD_TOUCH_DISTANCE = 0.80;
