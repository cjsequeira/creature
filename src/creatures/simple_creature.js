'use strict'

// ****** Creature setup ******


// idling function
const ActIdling = (creature) => ({
    glucose: creature.glucose - 2.4,
    neuro: creature.neuro + 1.2,
    behavior: (creature.glucose < 30.0)
        ? 'eating'
        : (creature.neuro > 80.0)
            ? 'sleeping'
            : 'idling'
});

// eating function
const ActEating = (creature) => ({
    glucose: creature.glucose + 4.0,
    neuro: creature.neuro + 2.6,
    behavior: (creature.glucose > 45.0) ? 'idling' : 'eating'
});

// sleeping function
const ActSleeping = (creature) => ({
    glucose: creature.glucose - 1.0,
    neuro: creature.neuro - 2.2,
    behavior: (creature.neuro < 60.0) ? 'idling' : 'sleeping'
});

// dispatch function
export const ActAsSimpleCreature = (creature) => {
    switch (creature.behavior) {
        case 'idling': return ActIdling(creature)
        case 'eating': return ActEating(creature)
        case 'sleeping': return ActSleeping(creature)
        default: return creature
    }
};

// behavior speeches
export const behaviorStrings = {
    idling: "I'm is idling! Blah...",
    eating: "I'm is eating!! Nom...",
    sleeping: "I'm is sleeping! Zzzz..."
};