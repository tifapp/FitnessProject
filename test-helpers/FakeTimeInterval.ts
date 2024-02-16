// Default implementation of requestAnimationFrame calls setTimeout(cb, 0),
// which will result in a cascade of timers - this generally pisses off test runners
// like Jest who watch the number of timers created and assume an infinite recursion situation
// if the number gets too large.
// https://stackoverflow.com/questions/42268673/jest-test-animated-view-for-react-native-app/51067606#51067606

export const frameTime = 30
