// ****** Code to practice weighted random draws of desires using desire functions as probability weights
'use strict'


// *** Test list of desire outputs
/*
// simple desire functions that give a random number in [0, 1], rounded to 2 decimal plaes
const calcDesireToIdle = () => Math.round(Math.random() * 100.0) / 100.0;
const calcDesireToEat = () => Math.round(Math.random() * 100.0) / 100.0;
const calcDesireToSleep = () => Math.round(Math.random() * 100.0) / 100.0;
*/

// simple desire functions that give fixed probability weights
const calcDesireToIdle = () => 1;
const calcDesireToEat = () => 10;
const calcDesireToSleep = () => 5;

// array of three desires; each desire is actually a function
const desireFuncs = [calcDesireToIdle, calcDesireToEat, calcDesireToSleep];

// desire labels for later reveal
const desireLabels = ['idle', 'eat', 'sleep'];


// *** Utility functions
// greater than or equal to
const geThan = x => y => (y >= x);


// *** Main code
// get numerical desires by evaluating each desire func with nifty shorthand
const numbers = desireFuncs.map(f => f());

// desires as cumulative array
const cum_numbers = numbers.reduce((a, x, i) => [...a, x + (a[i - 1] || 0)], []);

// max value in cumulative array
const max_cum_numbers = cum_numbers.reduce((a, x) => Math.max(a, x));

// random number in range of max value, as [0, max]
const randInRange = Math.random() * max_cum_numbers;

// choose first desire "box" that holds random number "target"
const chosenElem = cum_numbers.filter(x => geThan(randInRange)(x))[0];
const chosenIndex = cum_numbers.findIndex(x => geThan(randInRange)(x));

// show it all
console.log('Desire labels: ' + desireLabels);
console.log('Desire values: ' + numbers);
console.log('Cumulative desire values: ' + cum_numbers);
console.log('Max cumulative desire value: ' + max_cum_numbers);
console.log('Random number from uniform distrib: ' + randInRange);
console.log('Cumulative desire value element chosen by random number: ' + chosenElem);
console.log('Cumulative desire value index chosen by random number: ' + chosenIndex);
console.log('Chosen desire label: ' + desireLabels[chosenIndex]);

// outta here
process.exit();
