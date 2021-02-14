'use strict'

// ****** Main code ******

// *** Imports
// Styling and libraries
import 'bootstrap/dist/css/bootstrap.min.css';
import './custom.css';

// Our own stuff
import { storeInit } from './store_init.js';
import { renderState } from './reduxlike/reducers_renderers.js';
import {
    actionDispatch,
    addGeoChartData,
    addJournalEntry,
    addStatusMessage,
    addTimeChartData
} from './reduxlike/action_creators.js';


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
    if (myStore.journal[myStore.journal.length - 1].message != curBehavior) {
        myStore = actionDispatch(
            myStore,
            addStatusMessage(myStore.status_box, 'Time ' + curTime + ": " + curBehavior)
        );

        myStore = actionDispatch(
            myStore,
            addJournalEntry(myStore.journal, curTime, curBehavior)
        );
    }

    console.log(myStore.journal);

    // *** Update chart data
    // time chart: glucose
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

    // time chart: neuro
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

    // geospatial chart
    myStore = actionDispatch(
        myStore,
        addGeoChartData(
            myStore.creature_geo_chart,
            {
                x: myStore.creature.conds.x,
                y: myStore.creature.conds.y
            })
    );


    // *** render state
    myStore = renderState(myStore);


    // *** Update world time
    curTime = curTime + timeStep;

}, browserTime);