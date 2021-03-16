# Creature version 0.1.2

Eats, sleeps, and wanders - like a proper pet should!

Visit [https://arrogantfool-draft-creature.netlify.app/](https://arrogantfool-draft-creature.netlify.app/) to see it do its thang.

"Cute creature" icon by [LethargicEye on DeviantArt.](https://www.deviantart.com/lethargiceye/art/Cute-Creature-75055699)

[![Netlify Status](https://api.netlify.com/api/v1/badges/2984688a-76b0-4643-83ee-39ee6b0fcf79/deploy-status)](https://app.netlify.com/sites/arrogantfool-draft-creature/deploys)

## POTENTIAL next features:
* Implement creature food-finding functionality
* REFACTOR: Clean up/move all uses of mutableRand so it is obvious which code relies on "random" numbers and which does not
* * Explore how random numbers propagate through the code - e.g. just like probability concept of "random variables"
* * Remove/move to all uses of random in reducers? "Random" suggests side effects/state changes!
* * Monadic something-or-other: wrap a function in another function that returns {function output, updated seed}, then use another function to separate the output from the seed and save the seed in the store
* * Could make an action_applyRandom function that generates two actions: one action that does the random thing and gets an updated seed (or seed increment?), and a second action to save the updated seed in the store

For example:

    // actionGenerator: action generator of signature (arg0) => (arg1) => ... => (argN) => actionType
    // ...randGenerators: random num generators of array length N+1, signature (nth seed) => float
    
    action_applyRandom = (actionGenerator) => (...randGenerators) => ([
        randGenerators.reduce((fArgs, thisGen, i) => fArgs(thisGen(i)), actionGenerator),
        action_incrementSeed(randGenerators.length), 
    ])

* REFACTOR: Revise use of ChartJS data so that data sets are kept separate from ChartJS chart objects - challenge is rebuild/reassignment of app store during action dispatching. May require not storing chart object references in app store??? Or, make sure chart is always pointed to the chart data object during reducer execution???

## Changelog:
* **0.1.2**: Major bug fix in combineReducers
* **0.1.1**: Cleanup of creature behavior announcement code
* **0.1.0**: Establishment of "creature eats food" rules
* **0.0.12**: Initial creature - food interaction rule
* **0.0.11**: Major refactor of rulebook for increased flexibility
* **0.0.10**: Major refactors of action dispatch, physType-watching, and store architecture
* **0.0.9**: Substantial upgrade to implement physType property-watching and action-queuing functionality
* **0.0.8**: Substantial upgrade to execution to enable multiple creatures
* **0.0.7**: Major upgrade to timing loops; separated simulator update loop from UI update loop
* **0.0.6**: Movement of physics code to own functions to simplify rulebook; revision of creature "act" function to take a physContainerType as input
* **0.0.5**: Refactor of rulebook and data type usage to advance functional programming paradigm
* **0.0.4**: Substantial creature behavior and rulebook updates to implement "coasting idle." Numerous upgrades to better-implement functional programming paradigm
* **0.0.3**: Creation of data type that holds creature data as well as last rulebook rule applied to that creature
* **0.0.2**: Implemented first version of rulebook binary tree along with creature geospatial parameters and "wandering" behavior
* **0.0.1**: Initial version, with creature glucose and neuro parameters
