'use strict'

// ****** Main code ******

// *** Imports
// styling and libraries
import 'bootstrap/dist/css/bootstrap.min.css';
import './custom.css';

// our own stuff
import { actionDispatch, startSim, stopSim } from './reduxlike/action_creators.js';
import { doUpdateLoop } from './do_update_loop.js';
import { storeInit } from './reduxlike/store_init.js';
import { RULE_HIT_WALL, RULE_CONDS_OUT_OF_LIMITS } from './rulebook.js';


// *** HTML page references 
const creature_time_chart = 'page_time_chart';
const creature_geo_chart = 'page_geo_chart';
const creature_status_box = 'page_creature_status';


// *** Simulator setup 
// how often (in milliseconds) to call the function that does updates
var browserTime = 750;


// ***********************************************************************************
// *** Code that actually does stuff
// create a reference to an initialized store object
let myStore = storeInit(
    document.getElementById(creature_time_chart).getContext('2d'),
    document.getElementById(creature_geo_chart).getContext('2d'),
    document.getElementById(creature_status_box)
);

// begin regular evaluations of a closure containing doUpdateLoop applied to our store
let timerId = setInterval(() => doUpdateLoop(myStore), browserTime);

// start the sim running
myStore = actionDispatch(myStore, startSim());
// ***********************************************************************************