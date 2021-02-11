'use strict'

// ****** Simulation rulebook ******
// Inspired by: https://ericlippert.com/2015/05/11/wizards-and-warriors-part-five/

// rulebook resolver
// returns physicalType
export const ResolveRules = (physicalType = {}) => {
    return (physicalType.hasOwnProperty('act')) ? physicalType.act(physicalType) : physicalType;
};