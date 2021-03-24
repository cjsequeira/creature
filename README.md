# Creature version 0.1.9

Eats, sleeps, and wanders - like a proper pet should!

Visit [https://arrogantfool-draft-creature.netlify.app/](https://arrogantfool-draft-creature.netlify.app/) to see it do its thang.

"Cute creature" icon by [LethargicEye on DeviantArt.](https://www.deviantart.com/lethargiceye/art/Cute-Creature-75055699)

[![Netlify Status](https://api.netlify.com/api/v1/badges/2984688a-76b0-4643-83ee-39ee6b0fcf79/deploy-status)](https://app.netlify.com/sites/arrogantfool-draft-creature/deploys)

## POTENTIAL next features:
* Revise rulebook so it doesn't transform events in the middle of execution? Think through the logic of for/against
* Add creature color legend
* * Relative luminance calculator: https://planetcalc.com/7779/ 
* Implement creature food-finding functionality
* Implement creature draw scaling in geo chart: chart has its own coordinate system but creatures are in unscaled pixel units
* Add a "Dwarf Fortress"-like story engine to translate events to text
* * Make a rulebook just for story text generation?
* Review all code for reversibility, and implement application rewinding
* * May require doing all motions as deltas (changes) rather than direct assignments
* Establish creature drag, mass, forces, torques?

## Changelog:
* **0.1.9**: Refactored layout and added creature behavior color boxes
* **0.1.8**: Refactored entire code base to limit use of nested arrow functions; refined creature behavior
* **0.1.7**: Added creature collision functionality and "aching" behavior
* **0.1.6**: Added creature border color changes with behavior; trimmed behavior; adjusted layout
* **0.1.5**: Implementation of UI element update frequency control for efficiency
* **0.1.4**: ChartJS and food-eating efficiencies
* **0.1.3**: Implementation of immutable random numbers in "randM" monad
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
