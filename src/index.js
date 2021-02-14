'use strict'

// ****** Main code ******

// *** Imports
// Styling and libraries
import 'bootstrap/dist/css/bootstrap.min.css';
import './custom.css';

// Our own stuff
import { storeInit } from './store_init.js';
import { RULE_HIT_WALL, RULE_CONDS_OUT_OF_LIMITS } from './rulebook.js';
import { renderStateChanges } from './reduxlike/reducers_renderers.js';
import { makeChain } from './util.js';
import {
    actionDispatch,
    addGeoChartData,
    addJournalEntry,
    addStatusMessage,
    addTimeChartData,
    doCreatureAct
} from './reduxlike/action_creators.js';


// *** HTML page references 
const creature_time_chart = 'page_time_chart';
const creature_geo_chart = 'page_geo_chart';
const creature_status_box = 'page_creature_status';


// *** Simulator setup 
var curTime = 0.0;
var timeStep = 1.0;
var browserTime = 750;


// *** Status message objects/arrays
const behaviorStrings = {
    idling: "I'm is idling! Blah...",
    eating: "I'm is eating!! Nom...",
    sleeping: "I'm is sleeping! Zzzz...",
    wandering: "I'm is wandering! Wiggity whack!",
    frozen: "I'm is frozen! Brrrr....."
};

const ruleStringsArr = [
    RULE_HIT_WALL,
    RULE_CONDS_OUT_OF_LIMITS
];


// *** Non-const code setup
let myStore = storeInit(
    document.getElementById(creature_time_chart).getContext('2d'),
    document.getElementById(creature_geo_chart).getContext('2d'),
    document.getElementById(creature_status_box)
);

let curBehavior = '';


// *** Main update loop 
let timerId = setInterval(() => {
    // update creature and charts
    myStore = makeChain(
        // function to call repeatedly...
        actionDispatch,

        // ... using this store, until all actions listed below have been dispatched
        myStore,

        // act out creature behavior
        doCreatureAct(myStore.creatureStore),

        // add glucose data to time chart
        addTimeChartData(
            myStore.ui.creature_time_chart,
            0,
            {
                time: curTime,
                value: myStore.creatureStore.physicalElem.conds.glucose
            }),

        // add neuro data to time chart
        addTimeChartData(
            myStore.ui.creature_time_chart,
            1,
            {
                time: curTime,
                value: myStore.creatureStore.physicalElem.conds.neuro
            }),

        // add x-y data to geo chart
        addGeoChartData(
            myStore.ui.creature_geo_chart,
            {
                x: myStore.creatureStore.physicalElem.conds.x,
                y: myStore.creatureStore.physicalElem.conds.y
            })
    );

    // update status box and journal if creature behavior has just changed
    curBehavior = behaviorStrings[myStore.creatureStore.physicalElem.conds.behavior];
    if (myStore.journal[myStore.journal.length - 1].message != curBehavior) {
        // update status box
        myStore = actionDispatch(
            myStore,
            addStatusMessage(myStore.ui.status_box, 'Time ' + curTime + ": " + curBehavior)
        );

        // add journal entry
        myStore = actionDispatch(
            myStore,
            addJournalEntry(myStore.journal, curTime, curBehavior)
        );
    }

    // update status box and journal if last-used rule is one we want to verbalize
    ruleStringsArr.forEach((ruleString) => {
        if (myStore.creatureStore.lastRule.name === ruleString) {
            // update status box
            myStore = actionDispatch(
                myStore,
                addStatusMessage(
                    myStore.ui.status_box,
                    'Time ' + curTime + ": *** " +
                    myStore.creatureStore.physicalElem.name + " " + ruleString
                )
            );

            // add journal entry
            myStore = actionDispatch(
                myStore,
                addJournalEntry(
                    myStore.journal,
                    curTime,
                    myStore.creatureStore.physicalElem.name + " " + ruleString
                )
            );
        }
    })

    // render state
    myStore = renderStateChanges(myStore);

    // update world time
    curTime = curTime + timeStep;

}, browserTime);