'use strict';
// Make a function mimic another one
const mimicFn = require('mimic-fn');

// Pass in a function and optional options object, set to an empty object by default
module.exports = (fn, options = {}) => {
	
	// check if the fn input is actually a function, otherwise immediately error out
	if (typeof fn !== 'function') {
		throw new TypeError(`Expected the first argument to be a function, got \`${typeof fn}\``);
	}
	
	// Declare mutable variables for later use
	let timeout;
	let result;
	
	// Define a variable and assign to a function that takes in a 
	// variable number of arguments and uses rest to add the arguments
	// into an array
	const debounced = function (...args) {
		// Save the this context? Not sure why at this point
		// later is an arrow function with no lexical scope, the this value
		// should be the this value of the surrounding function
		const context = this;
		
		// Define a variable and assign an arrow function
		const later = () => {
			// set the timeout variable to null
			timeout = null;
			// If there is no immediate property on the options object or if it is falsy
			if (!options.immediate) {
				// Assign the value of calling fn to the result variable
				// Use apply to pass in the array of args, with a context
				// of this saved from the surrounding function
				// the later function has access to timeout, options, result, fn, context & args through closure
				result = fn.apply(context, args);
			}
		}; // END later
		
		// Create a Boolean of true if the options object has the immediate property
		// and the value of timeout is still null
		const callNow = options.immediate && !timeout;
		
		clearTimeout(timeout);
		
		// clear and reset a timeout function that will either be called 
		// after options.wait, or after the following synchronous code executes
		// the timeout will call the later function when it executes
		timeout = setTimeout(later, options.wait || 0);
		
		// If callNow is true, call fn immediately with args
		if (callNow) {
			result = fn.apply(context, args);
		}
		
		// Return the result
		return result;
		
	}; // END debounced
	
	// debounced will mimic fn, essentially adding the props of debounced 
	// to the passed in function and returning debounced instead of the original fn
	mimicFn(debounced, fn);
	
	// Add a function to a cancel property on the debounced / fn function
	// This could be used within a script to completely cancel execution of the fn
	debounced.cancel = () => {
		// If timeout is truthy, clear it and reset to null
		if (timeout) {
			clearTimeout(timeout);
			timeout = null;
		}
	};

	return debounced;
};
