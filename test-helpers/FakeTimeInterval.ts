// Default implementation of requestAnimationFrame calls setTimeout(cb, 0),
// which will result in a cascade of timers - this generally pisses off test runners
// like Jest who watch the number of timers created and assume an infinite recursion situation
// if the number gets too large.
//
// Setting the timeout simulates a frame every 1/100th of a second

export const frameTime = 10
