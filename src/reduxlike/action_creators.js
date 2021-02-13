'use strict'

// ****** Code for creating actions ******
// *** Action names
export const ACTION_ADD_TIMECHART_DATA = 'ADD_TIMECHART_DATA';
export const ACTION_ADD_GEOCHART_DATA = 'ADD_GEOCHART_DATA';


// *** Action creator functions
// add time chart data
export const addTimeChartData = (chart, dataIndex, yTimePair) => ({ 
    type: ACTION_ADD_CHART_DATA, 
    chart,
    dataIndex,
    yTimePair
});

// add geo chart data
export const addGeoChartData = (chart, dataIndex, xyPair) => ({ 
    type: ACTION_GEO_CHART_DATA, 
    chart,
    dataIndex,
    xyPair
});
