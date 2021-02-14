'use strict'

// ****** Code for creating actions ******

// *** Our imports
import { rootReducer } from './reducers.js';


// *** Action names
export const ACTION_ADD_TIMECHART_DATA = 'ADD_TIMECHART_DATA';
export const ACTION_ADD_GEOCHART_DATA = 'ADD_GEOCHART_DATA';
export const ACTION_ADD_STATUS_MESSAGE = 'ADD_STATUS_MESSAGE';


// *** Action creator functions
// add time chart data
// yTimePair is { time: , value: }
export const addTimeChartData = (chart, dataIndex, yTimePair) => ({ 
    type: ACTION_ADD_TIMECHART_DATA, 
    chart,
    dataIndex,
    yTimePair
});

// add geo chart data
// xyPair is { x: , y: }
export const addGeoChartData = (chart, xyPair) => ({ 
    type: ACTION_ADD_GEOCHART_DATA, 
    chart,
    xyPair
});

// add status message
export const addStatusMessage = (statusBox, message = '') => ({
    type: ACTION_ADD_STATUS_MESSAGE,
    statusBox,
    message
});


// *** Action dispatcher function
export const actionDispatch = (store, action) => rootReducer(store, action);