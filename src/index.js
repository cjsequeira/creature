'use strict'

// ****** Main code ******

// *** Imports
// Styling and libraries
import 'bootstrap/dist/css/bootstrap.min.css';
import { data } from 'jquery';
import './custom.css';

// Our own stuff
import { storeInit } from './store_init.js';
import { actionDispatch, addGeoChartData, addStatusMessage, addTimeChartData } from './reduxlike/action_creators.js';


// *** HTML page references 
const creature_time_chart = 'page_time_chart';
const creature_geo_chart = 'page_geo_chart';
const creature_status_box = 'page_creature_status';


// *** Simulator setup 
var curTime = 0.0;
var timeStep = 1.0;
var browserTime = 750;


// *** Simple status message object
const behaviorStrings = {
    idling: "I'm is idling! Blah...",
    eating: "I'm is eating!! Nom...",
    sleeping: "I'm is sleeping! Zzzz...",
    wandering: "I'm is wandering! Wiggity whack!",
    frozen: "I'm is frozen! Brrrr....."
};


// *** Non-const code setup
let myStore = storeInit(
    document.getElementById(creature_time_chart).getContext('2d'),
    document.getElementById(creature_geo_chart).getContext('2d'),
    document.getElementById(creature_status_box)
);

let curBehavior = '';


// *** Main update loop 
let timerId = setInterval(() => {
    // *** Update creature
    myStore.creature = myStore.creature.act(myStore.creature);


    // *** Update status box and journal if creature behavior has just changed
    curBehavior = behaviorStrings[myStore.creature.conds.behavior];
    if (myStore.journal[myStore.journal.length - 1].entry != curBehavior) {
        myStore = actionDispatch(
            myStore,
            addStatusMessage(myStore.status_box, 'Time ' + curTime + ": " + curBehavior)
        );

        myStore.journal = [...myStore.journal, { time: curTime, entry: curBehavior }];
    }


    // *** Update charts
    // glucose and neuro
    myStore = actionDispatch(
        myStore,
        addTimeChartData(
            myStore.creature_time_chart,
            0,
            {
                time: curTime,
                value: myStore.creature.conds.glucose
            })
    );
    myStore = actionDispatch(
        myStore,
        addTimeChartData(
            myStore.creature_time_chart,
            1,
            {
                time: curTime,
                value: myStore.creature.conds.neuro
            })
    );
    myStore.creature_time_chart.update();

    // geospatial
    myStore = actionDispatch(
        myStore,
        addGeoChartData(
            myStore.creature_geo_chart,
            {
                x: myStore.creature.conds.x,
                y: myStore.creature.conds.y
            })
    );
    myStore.creature_geo_chart.update();


    // *** Update world time
    curTime = curTime + timeStep;

}, browserTime);