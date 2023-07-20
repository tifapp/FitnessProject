# tiF Frontend Code Styleguide

## Intro

This style guide exists to make typescript development somewhat sane compared to other languages, since most of us primarily work in other languages outside of typescript. By making this document, it should serve as a moderately useful official reference for how things should be done.

## Rule 1: Break any rule in this style guide as you please

Every line of code must be written with reason, intention, and purpose. Therefore, nothing in here is an absolute, and thus should be ignored as necessary. In fact, we may change some of these guidelines over time as new patterns emerge. Regardless, the biggest takeaway is to of course have a reason for every rule you break.

## Table of Contents

I. Casing
II. Variables
III. Functions
IV. Strings
V. Arrays, Sequences, and Collections
VI. Constants
VII. Classes
VIII. Types
IX. Enums
X. Interfaces
XI. Modules, Importing, and Exporting
XII. General Naming Rules
XIII. Commenting and Documentation
XIV. Dependency Injection
XV. Objects
XVI. Testing
XVII. React/React Native
XVIII. 3rd Party Libraries
XIX. Miscellaneous Guidelines

## Casing

### Rule 1: PascalCase for types, interfaces, classes, react components, and zod schemas

Some of these are conventions based on libraries (eg. React and Zod)

```ts
// 🔴 BAD
type dataType = {}
type data_type = {}
type DATA_TYPE = {}

// 🟢 GOOD
type DataType = {}
```

### Rule 2: camelCase for everything else

snake_case was invented by Alfaðör, the god of the destruction, to subdue the living to a never ending crisis in ancient times over power disputes between Thor and Loki. We have already had to sacrifice Derek to solve this crisis, let’s not try to bring it back.

```ts
// 🔴 BAD
const object_thing = {
  object_key: "No, don't do this... This offsets balance in the universe..."
}

// 🟢 GOOD
const objectThing = {
  objectKey: "Thank goodness, you saved the world!"
}
```

**I would like to apologize for my use of snake case in that example, I have prayed to the appropriate authorities as to not revive the crisis**

### Rule 3: Wrap snake_case names from 3rd party Code/APIs in types that are camelCase

Some 3rd parties sided with Alfaðör in ancient times, and unfortunately they must keep their devotion to snake_case as to not be erased from existence. However, we’ll just wrap their crap in our own types to keep things consistent.

```ts
import { ShittyUser, shittyClient } from "shitty-sdk"

// 🔴 BAD
const fetchFromThirdPartyBad = async () => {
  const data = await shittyClient.get<ShittyUser>()
  // Do stuff with the data in snake_case
  return data // Now leak snake_case to the outside world...
}

// 🟢 GOOD
type NotShittyUserResponse = {
  userId: string
}

const fetchFromThirdPartyBad = async () => {
  const data = await shittyClient
    .get<ShittyUser>()
    .then((res) => ({ userId: res.user_id } as NotShittyUserResponse))
  // Do stuff with the data in camelCase
  return data
}
```

## Variables

### Rule 1: Avoid `var`

`var` hoists variables to upper scopes which causes many surprises. We hate javascript’s surprises enough already, so let’s do 1 more thing to not make it worse. Just use `let` and `const` instead.

```ts
// 🔴 BAD
var thing = 0

// 🟢 GOOD
let thingLet = 0
const thingConst = 0
```

### Rule 2: Avoid `let` unless you need reassignment

Fairly straightforward, keywords should express intention, and don’t express intention that isn’t needed. In most cases `let` isn’t needed, so when it is then it should make sense.

```ts
// 🔴 BAD
const thingBad = () => {
  let num = getNum()
  // Tons of other logic that does not reassign num but uses it...
  return num + 1
}

// 🟢 GOOD
const thingGood = () => {
  const num = getNum()
  // Logic...
  return num + 1
}
```

## Functions

### Rule 1: Prefer arrow functions over the `function` keyword (when possible)

Arrow functions are more concise, and bring home the point that functions are first class objects. Additionally, there’s no `this` bs, so we can also remove another nasty javascript surprise.

```ts
// 🔴 BAD
function funcBad() {
  this.property = 1 // This does some weird stuff, which is what classes should be used for instead...
  return 1
}

// 🟢 GOOD
const funcGood = () => 1
```

In some cases, the `function` keyword is needed, such as in async generators.

```ts
// 🟡 EXCEPTION (An async generator can only be created with the function keyword)
async function* foo() {
  yield await Promise.resolve("a")
  yield await Promise.resolve("b")
  yield await Promise.resolve("c")
}
```

We’ll count those cases as an exception to this rule.

### Rule 2: Functions should do “1 concept”

1 thing is too hard to come to an agreement on, so 1 concept gives a little bit more leeway. At the same time, doing too many small things isn’t desirable since it can obscure context.

```ts
// 🔴 BAD (This isn't C)
const iHatePeopleSoThisWontHaveAGoodName = () => {
	// Do the thing first
	let thingStart = 0
	// 100 lines of hieroglyphics...

	// Now do the other thing...
	let thingMiddle = 1
  // 300 lines of hieroglyphics...

  // Now summon the Alien God
	const alienGod = thingStart <<< 69 * (thingMiddle >>> 420) >> 0xDEADBEEF << 0xBEEFD00D >> 0xA47SHBUYVWVUDVSUZIXB
  // 1,000 lines of alien speak

	// Finally, we return the new universe
	return alienGod << 0xFUCKYOU >> 0xNEWUNIVERSE
}

// 🔴 BAD (Too much abstraction)
const newUniverseRitualBad = () => {
	const alienGod = summonAlienGodFromRituals()
	performAlienSpeak(alienGod)
	return newUniverse(alienGod)
}

const performAlienSpeak = (alienGod: AlienGod) => {
	if (isTrueAlienGod(alienGod)) {
	  alienGodSpeak(alienGod)
	}
}

const isTrueAlienGod = (alienGod: AlienGod) => {
	return !isFalseAlienGod(alienGod)
}

const alienGodSpeak = (alienGod: AlienGod) => {
	sayThingAsAlienGod(alienGod, "Die")
}

// 🟢 GOOD (Just the right amount of abstraction)
const newUniverseRitualGood = () => {
	const alienGod = summonAlienGod(performThingStartRitual(), performThingMiddleRitual())
	if (isTrueAlienGod(alienGod)) {
	  sayThingAsAlienGod(alienGod, "Die")
	}
	return newUniverse(alienGod)
}
```

In general, don’t go on 1000 line tangents, but also don’t shrink things as much as possible. When functions have “just the right amount of abstraction”, the code should be easily to follow, test, modular, etc.

### Rule 3: Utilize return types for non-trivial operations

In many cases, it’s just best to let typescript infer return types from functions. However, for more complex operations such as ones that use discriminated union return values or multiple return targets based on the branch, it can be helpful to include the return type primarily for documentation purposes.

```ts
type SomeUnion = { status: "good"; value: true } | { status: "bad" }

// 🔴 BAD (Trivial functions don't need return types)
const addBad = (a: number, b: number): number => a + b

// 🔴 BAD (Omitting return type from complex object)
const unionBad = () => ({
  value: { status: "bad" },
  other: 1
})

// 🟢 GOOD (Lets typescript infer simple function)
const addGood = (a: number, b: number) => a + b

// 🟢 GOOD (Uses return type for complex object)
type UnionResult = {
  value: SomeUnion
  other: number
}

const unionGood = (): UnionResult => ({
  value: { status: "bad" },
  other: 1
})
```

### Rule 4: Do not reassign/mutate function parameters

This can possibly cause unintended side-effects since objects are passed by reference in javascript. It’s even better in fact if you wrap the parameter type in `Readonly`, since then it guarantees that no mutations can occur.

```ts
// 🔴 BAD
const funcBad = (a: SomeObject) => {
  a.value = 1 // Mutates the object used by the caller
}

// 🔴 BAD
const funcBad = (a: number) => {
  a = 1 // Even if this is primitive, it can mess with V8 optimizations
}

// 🟢 GOOD
const funcGood = (a: Readonly<SomeObject>) => {
  return { ...a, value: 1 }
}
```

### Rule 5: Default parameters come last

By doing this, we can easily make it so that default params don’t need to be filled out when needing to provide a value for later params. It also allows us to use partial application.

```ts
// 🔴 BAD
const funcBad = (a: number = 1, b: string) => {}

// 🟢 GOOD
const funcGood = (b: string, a: number = 1) => {}

// 🍆 BONUS (We can partially apply funcGood as the default here when we can't with funcBad)
const other = (func: (str: string) => void = funcGood) => {}
```

### Rule 6: Well known calculations/algorithms should always be abstracted into separate functions

We don’t need to see your cryptic integer hash function inlined when it has an actual well known name.

```ts
// 🔴 BAD
const funcBad = () => {
  const a = getNum()
  a = a + 0x7ed55d16 + (a << 12)
  a = a ^ 0xc761c23c ^ (a >> 19)
  a = a + 0x165667b1 + (a << 5)
  a = (a + 0xd3a2646c) ^ (a << 9)
  a = a + 0xfd7046c5 + (a << 3)
  a = a ^ 0xb55a4f09 ^ (a >> 16)
  return a
}

// 🟢 GOOD
const funcGood = () => jenkinsHash(getNum())

const jenkinsHash = (num: number) => {
  const a = num
  a = a + 0x7ed55d16 + (a << 12)
  a = a ^ 0xc761c23c ^ (a >> 19)
  a = a + 0x165667b1 + (a << 5)
  a = (a + 0xd3a2646c) ^ (a << 9)
  a = a + 0xfd7046c5 + (a << 3)
  a = a ^ 0xb55a4f09 ^ (a >> 16)
  return a
}
```

### Rule 7: Function names should be descriptive and read like English

Code is easy to follow when it tells a story, and doesn’t read like a “Persuasive essay” written by a high-school freshman in their English class.

```ts
// 🔴 BAD (validationProcedure doesn't really tell me anything)
const validationProcedure = (
  validationMethod: (stringToValidate: string) => boolean,
  data: string
) => {
  const isInvalid = !validationMethod(data)
  // Other logic...
  return validationStatusFunction(isInvalid)
}

// 🟢 GOOD
const validateData = (
  getValidationResult: (stringToValidate: string) => boolean,
  data: string
) => {
  const isInvalid = !getValidationResult(data)
  // Other logic...
  return processValidationResult(isInvalid)
}
```

### Rule 8: Multiline functions with long signatures

But like, do it in the correct way…

```ts
// 🔴 BAD (No Multilining)
const funcNoMultiline = (
  thisIsAnArgument: () => string,
  other: (a: string, b: number) => Omit<SomeType, "death">
): SomeUnion => {}

// 🔴 BAD (Weird Multilining)
const funcBadMultiline = (
  thisIsAnArgument: () => string,
  other: (a: string, b: number) => Omit<SomeType, "death">
): SomeUnion => {}

// 🟢 GOOD (Correct Multilining)
const funcGoodMultiline = (
  thisIsAnArgument: () => string,
  other: (a: string, b: number) => Omit<SomeType, "death">
): SomeUnion => {}
```

### Rule 9: Always use parentheses around lambda arguments

That way, it’s easier to tell that it’s a function.

```ts
// 🔴 BAD
const bad = () => [1, 2, 3].map((n) => n + 1)

// 🟢 GOOD
const bad = () => [1, 2, 3].map((n) => n + 1)
```

### Rule 10: Remove uneccessary parameters

Functions are easier to call when they have less required parameters and not more. Ideally, a function shouldn’t have more than 3 required parameters, otherwise combine the parameters into an object.

```ts
// 🔴 BAD
const areLocationsCloseBad = (
  latitude1: number,
  longitude1: number,
  latitude2: number,
  longitude2: number,
  thresholdMeters: number = 1000
) => {}

// 🟢 GOOD
type LocationCoordinate2D = {
  latitude: number
  longitude: number
}

const areLocationsCloseGood = (
  location1: LocationCoordinate2D,
  location2: LocationCoordinate2D,
  thresholdMeters: number = 1000
) => {}
```

### Rule 11: Avoid excessive options parameters

Functions that take in a so-called “bag of options” are functions that are grounds to do more than 1 concept and thus become hard to maintain and test in the future. Instead, make separate functions for each common operation expressed by the options bag.

```ts
// 🔴 BAD
type LoadEventsOptions = {
  isSorted?: boolean
  limit?: number
  center?: LocationCoordinate2D
  keywordFilters?: string[]
  // More options...
}

const loadEvents = (options?: LoadEventsOptions) => {
  // ...
}

// 🟢 GOOD
// In this specific case, it may be better to make some kind
// of generic LoadEventsRequest type so that the limit doesn't
// need to be parameterized on every function.

const loadEventsByRegion = (center: LocationCoordinate2D, limit: number) => {
  // ...
}

const loadEvents = (limit: number) => {
  // ...
}

// Other operations...
```

## Strings

### Rule 1: Use double-quotes

Single quotes are what Alfaðör, the god of destruction, used. We are opposed to him, so double quotes will suffice.

```ts
// 🔴 BAD
const bad = "You think this is funny???!!!"

// 🟢 GOOD
const good = "Nice..."
```

### Rule 2: Break up long strings into multiple lines

So we can like read them or something. Just do it the right way.

```ts
// 🔴 BAD
const bad =
  "According to all known laws of aviation, there is no way a bee should be able to fly. The bee of course... OK WHAT THE HELL IS THIS DIRECTOR, WE'RE GONNA GET SUED FOR COPYRIGHT!!!"

// 🔴 BAD (Uses +)
const bad2 =
  "This is really long" +
  "So we do this to put it on multiple lines" +
  "Which looks weird"

// 🟢 GOOD
const good =
  "Hello world, watch how we can go to \
multiple lines like that! See, really easy and there's \
no stupic + sign that we have to use"

// 🟢 GOOD (However this will insert new lines)
const good2 = `
Now we can write as many lines as we want, like html:

<h1>No</h1>
`
```

### Rule 3: Use template literals for string interpolation

It reads easier.

```ts
const num = 1

// 🔴 BAD
const bad = "Hello " + num + " world"

// 🟢 GOOD
const good = `Hello ${num} world`
```

## Arrays/Collection/Sequence types

### Rule 1: Prefer functional iteration when possible

Eg. Use `map`, `filer`, `reduce`, and `forEach` in most cases.

```ts
// 🔴 BAD
const funcBad = () => {
	const arr = [1, 2, 3]
	const new = []
	for (const num of arr) {
		if (num % 2 === 0) {
			new.push(`${num}`)
		}
	}
	return new
}

// 🟢 GOOD
const funcGood = () => {
	return [1, 2, 3].filter((n) => n % 2 === 0).map((n) => `${n}`)
}
```

However, this is not always best for performance, so break this rule accordingly.

```ts
// 🟡 EXCEPTION (Use for loops in performant code)
const funcThatMustBePerformant = () => {
  const arr = oneMillionNumbers
  for (const num of arr) {
    if (num % 2 === 0) {
      updateArr(arr)
    }
  }
  return arr
}
```

### Rule 2: Use literals for simple arrays

We don’t need the `new` syntax to create an array.

```ts
// 🔴 BAD
const bad = new Array<number>()

// 🟢 GOOD
const good = []
const good2 = [1, 2, 3]
```

### Rule 3: Use `...` to copy arrays

Note that this performs a shallow copy, so object mutations will still mutate the original array, but in that case you should use a deep copy.

```ts
const original = [1, 2, 3]

// 🔴 BAD
const newBad = []
for (const num in orginal) {
  newBad.push(num)
}

// 🟢 GOOD
const newGood = [...original]
```

### Rule 4: Consider using other collection types when applicable

And not just `Set` and `Map`, but also things like `Int16Array` or `TypedArray` which allow for fixed sized arrays for instance.

## Constants

### Rule 1: Constants must be named LIKE_THIS

Since constants are well, constant, we should be able to easily discern them otherwise they stand out like normal variables.

```ts
// 🔴 BAD
const metersPerMile = 1609.344

// 🟢 GOOD
const METERS_PER_MILE = 1609.344
```

### Rule 2: Use constants for literals that mean something

This makes things way easier to understand, especially if we need to reuse them (or if they change in their real world context like URLs).

```ts
// 🔴 BAD
const apiResponseBad = await fetch("https://api.distance.com/convert", {
  body: { a: 3.14597, b: 1609.344 }
})

// 🟢 GOOD
const DISTANCE_API_BASE_URL = "https://api.distance.com"
const METERS_PER_MILE = 1609.344
const apiResponseGood = await fetch(`${DISTANCE_API_BASE_URL}/convert`, {
  body: { a: Math.PI, b: METERS_PER_MILE }
})
```

### Rule 3: Don’t use constants if they obscure context

This is similar to having too much abstraction in functions. It obscures context.

```ts
// 🔴 BAD
const SIN2_CONSTANT = 1
const SIN2_MULTIPLIER = 2
const SIN2_DIVISOR = 2

const sin2Bad = (radians: number) => {
  return (SIN2_CONSTANT - Math.cos(SIN2_MULTIPLIER * radians)) / SIN2_DIVISOR
}

// 🟢 GOOD
const sin2Good = (radians: number) => (1 - Math.cos(2 * radians)) / 2
```

A good rule of thumb is, if the constant’s name is generic (eg. `SIN2_CONSTANT`) then it probably shouldn’t be a constant.

### Rule 4: Use underscores for large numbers

It makes them easier to read. Do this when the number has 5 or more digits.

```ts
// 🔴 BAD
const ONE_MILLION_BAD = 1000000

// 🟢 GOOD
const ONE_MILLION_GOOD = 1_000_000
```

## Classes

### Rule 1: Use classes when dealing with data structures or when encapsulation is needed

Objects exist in every program, so unlike many javascript practitioners, we enjoy them. However, we don’t need them everywhere.

```ts
// 🔴 BAD (Use a function instead)
class DateFormatter {
  format(date: Date) {
    return `${date}+0000`
  }
}

// 🟢 GOOD
class FixedDateRange {
  // Data structure that encapsulates logic around keeping a start date before an end date and vice versa
  private _startDate: Date
  private _endDate: Date

  constructor(startDate: Date, endDate: Date) {
    this._startDate = startDate
    this._endDate = endDate
  }

  get startDate() {
    return this._startDate
  }

  get endDate() {
    return this._endDate
  }

  moveStartDate(newDate: Date) {
    // ...
  }

  moveEndDate(newDate: Date) {
    // ...
  }
}

// 🟢 GOOD (Encapsulates caching and searching)
class EventsSearcher {
  private cache = new Map<string, Event[]>()
  private api: TiFClient

  async search(query: string) {
    if (this.cache.has(query)) return this.cache[query]
    const results = await this.api.search(query)
    this.cache[query] = results
    return results
  }
}
```

### Rule 2: Avoid class names like `XXXManager`, `XXXService`, `XXXGateway`

It’s very common to see the infamous “Manager” or “Service” classes, and those suffixes often don’t convey any information about the class itself. This leads to them becoming a code dumping ground which often breaks the Single Responsibility Principle.

```ts
// 🔴 BAD
class LocationManager {
  requestPermission() {
    // ...
  }

  observeLocation() {
    // ...
  }

  sendLocationUpdate() {
    // ...
  }
}

// 🟢 GOOD
class LocationObserver {
  observeLocation() {
    // ...
  }
}

// NB: Maybe requesting permissions and sending updates don't
// hold any state, so they can be simple functions

const requestPermission = () => {
  // ...
}

const sendLocationUpdate = () => {
  // ...
}
```

### Rule 3: Prefer composition over inheritance (most of the time)

Inheritance creates large trees of classes, where a sub-class takes on the entire jungle when it just needed a banana. With composition, it can just hold onto the banana, and not have the functionality of a jungle. A monk isn’t a jungle after all.

```ts
// 🔴 BAD
class BadBanana extends Jungle {}

// The monke now gets the whole jungle functionality
// which doesn't make sense since it's a monkey
class BadMonke extends BadBanana {}

// 🟢 GOOD
class GoodBanana {
  private jungle: Jungle
}

class GoodMonke {
  private banana: GoodBanana
}
```

However, sometimes inheritance does make sense when the object you’re dealing with is actually a form of the base class. For instance, a rain forest is actually considered a jungle, so it could theoretically inherit from `Jungle` no problem.

Inheritance is also useful in testing when dealing with a 3rd party SDK that exposes classes where we can’t control their behavior.

```ts
// 🟡 EXCEPTION (A rainforest is actually a jungle)
class RainForest {}

// 🟡 EXCEPTION (Testing)
class TestThing extends ThingThatComesFromALibraryWeDontControl {}
```

In general however, inheritance isn’t often needed, and composition is better even in the exception cases described above as it’s still possible to “inherit” the consequences of inheritance in those cases.

### Rule 4: Avoid direct setters if possible

A class should have some form of encapsulation, and setters often encourage patterns where a caller can arbitrarily mutate a Classe’s internal and encapsulated state. This often leads to duplicated code that doesn’t encapsulate the essence of what we’re trying to do, but most importantly it allows us to change the internal representation of a property at a later date.

```ts
// 🔴 BAD (Unencapsulated state)
class BadMonster {
  isDead = false
}

const killBadMonster = () => {
  const monster = new BadMonster()
  monster.isDead = true
}

// 🔴 BAD (Better, but still allows direct mutation of internal state)
class BadSetterMonster {
  private _isDead = false

  public get isDead() {
    return this._isDead
  }

  public setIsDead(isDead: boolean) {
    this._isDead = isDead
  }
}

const killBadSetterMonster = () => {
  const monster = new BadSetterMonster()
  monster.setIsDead(true)
}

// 🟢 GOOD
class GoodMonster {
  private _isDead = false

  public get isDead() {
    return this._isDead
  }

  // This method actually exposes the true intent of any of this classes' clients
  public kill() {
    this._isDead = true
  }
}

const killGoodMonster = () => {
  const monster = new GoodMonster()
  monster.kill()
}
```

### Rule 5: Derive state, don’t synchronize

If you have to keep 2 variables manually in sync, then it’s likely that one can be computed from the other. This makes synchronizing the 2 less error-prone since you only need to update the source of truth.

```ts
// 🔴 BAD
class BadMonster {
  private _lives = 10
  private _isDead = false

  public get isDead() {
    return this._isDead
  }

  public kill() {
    this._lives--
    if (this._lives <= 0) {
      this._isDead = true
    }
  }
}

// 🟢 GOOD
class BadMonster {
  private _lives = 10

  public get isDead() {
    return this._lives <= 0
  }

  public kill() {
    this._lives--
  }
}
```

### Rule 6: Use classes as validation containers

Say we want to send a message to a user based on their user handle. A user handle is a string that must be in a precise format. When we want to work with a user handle, we shouldn’t have to make assumptions or validate it every time. Instead we can use classes to make our intentions explicit.

```ts
// 🔴 BAD
const sendMessageToUser = (handle: string) => {
  if (!isValidUserHandle(handle)) {
    throw new Error("Invalid handle")
  }
  // ...
}

// 🟢 GOOD
class UserHandle {
  public readonly rawValue: string

  // NB: Ensure we can't create an invalid handle from the outside
  private constructor(rawValue: string) {
    this.rawValue = rawValue
  }

  static fromString(s: string) {
    if (!isValidUserHandle(s)) return undefined
    return new UserHandle(s)
  }
}

const sendMessageToUser = (handle: UserHandle) => {
  // We can assume that the handle is valid...
}
```

## Types

### Rule 1: Use types for simple data structures

Types come with a lot less surprises than interfaces, but in general, and interface should be analogous to what it is in other languages (eg. Protocols in Swift). Where as types should fill the hole for simple data types (eg. structs in Swift, or data classes in Kotlin)

```ts
// 🔴 BAD
interface LocationCoordinate2D {
  latitude: number
  longitude: number
}

// 🟢 GOOD
type LocationCoordinate2D = {
  latitude: number
  longitude: number
}
```

### Rule 2: Use types to ensure invalid states cannot exist (where possible)

Invalid states are harder to test and reason about, if 2 variables can never be both true at the same time, why even allow that in the type system?

```ts
// NB: Let's pretend for this example that only 1 page can be shown at any given time.

// 🔴 BAD
type BadScreenState = {
  isShowingPage1: boolean
  isShowingPage2: boolean
  isShowingPage3: boolean
}

// 🟢 GOOD
type Page = "page1" | "page2" | "page3"
type GoodScreenState = {
  presentedPage?: Page
}
```

### Rule 3: Use optional syntax over undefined explicitly when possible

It’s a bit conciser.

```ts
// 🔴 BAD
type Bad = {
  thing: string | undefined
}

// 🟢 GOOD
type Good = {
  thing?: string
}
```

### Rule 4: Prefer unknown (or a concrete type) over any

You will be required to validate any properties on an `unknown` whereas anything goes with any. Better yet, use zod to validate the `unknown` into a concrete type.

```ts
const isEmpty = (s: string) => s.length === 0

// 🔴 BAD (No validation on obj)
const funcBad = (obj: any) => isEmpty(obj.text)

// 🟢 GOOD
import { z } from "zod"
const Good = z.object({ text: z.string() })

const funcGood = (obj: unknown) => {
  const data = Good.parse(obj)
  return isEmpty(data.text) // Strongly typed
}
```

## Enums

### Rule 1: Prefer discriminated unions over Enums

Enums is typescript are weird and limited, so prefer not to use them when possible. Discriminated unions are much more powerful for adding associated data to an enum.

```ts
// 🔴 BAD
enum Bad {
	A = 1
	B = "Hello"
}

// 🟢 GOOD
type Good = { case: "A", num: number } | { case: "B", str: string }
```

### Rule 2: Use enums when you need a “strongly typed” object

One powerful things about enums are that they are nominal types (eg. I can’t pass in a string to a function that takes an enum even if the underlying data is the same). Additionally, enums are also just javascript objects, and can be used as such.

```ts
// 🟢 GOOD
export enum EventColor {
  Red = "#EF6351",
  Purple = "#CB9CF2",
  Blue = "#88BDEA",
  Green = "#72B01D",
  Pink = "#F7B2BD",
  Orange = "#F4845F",
  Yellow = "#F6BD60"
}

// Iterate abstractly over all cases
export const eventColorPickerOptions = Object.entries(EventColors).map(
  ([name, color]) => ({
    accessibilityLabel: name,
    color
  })
)
```

## Interfaces

### Rule 1: Use interfaces for abstracting functionality

Sort of like how classes can implement interfaces in other languages, we should keep that prior familiar art here.

```ts
// 🔴 BAD
type BadThing = {
  loadEvents: () => Promise<Event[]>
}

// 🟢 GOOD
interface GoodThing {
  loadEvents(): Promise<Event[]>
}

class APIThing implements GoodThing {
  async loadEvents() {
    // ...
  }
}
```

### Rule 2: Use interfaces to genericize simple data types

Sometimes we only care if the data has a certain property, interfaces work best for this purpose as well.

```ts
type Thing1 = { id: string; name: string }
type Thing2 = { id: string; num: number }

// 🔴 BAD
const filterThing1 = (t: Thing1[]) => {
  return t.filter((t) => t.id === "hello")
}

const filterThing2 = (t: Thing2[]) => {
  return t.filter((t) => t.id === "hello")
}

// 🟢 GOOD
interface Identifiable {
  id: string
}

// We can call this with either an array of Thing1 or Thing2
const filterIds = (identifiables: Identifiable[]) => {
  return identifiables.filter((t) => t.id === "Hello")
}

const thing1Arr = [
  /* ... */
] as Thing1[]
const thing2Arr = [
  /* ... */
] as Thing2[]
filterIds(thing1Arr)
filterIds(thing2Arr)
```

### Rule 3: A class that implements an interface should not have a name following `InterfaceNameImpl`

Like, maybe use the classes responsibility as a differentiator?

```ts
interface Syncable {
  sync(): void
}

// 🔴 BAD
class SyncableImpl implements Syncable {
  private cloudKitHandle: CloudKitHandle
  // ...
}

// 🟢 GOOD
class CloudKitSyncable implements Syncable {
  private cloudKitHandle: CloudKitHandle
  // ...
}
```

### Rule 4: Avoid implicit interface extensions

It’s just another typescript surprise that we don’t need. Just make a separate interface and combine them as needed…

```ts
// 🔴 BAD (Causes BadThing to have both a name and num prop)
interface BadThing {
  name: string
}

interface BadThing {
  num: number
}

// 🟢 GOOD (Only ThingWithNumeric has both props)
interface Thing {
  name: string
}

interface ThingWithNumeric extends Thing {
  num: number
}
```

### Rule 5: Keep interfaces small

Classes implementing Interfaces are much harder compose with larger interfaces. Additionally, it’s likely that one or more of the operations will change at a different rate than the rest. Classes can always implement multiple interfaces.

```ts
// 🔴 BAD
interface EventRepository {
  loadEvent(id: string): Promise<Event>
  loadEvents(): Promise<Event[]>
  searchEvents(query: string): Promise<Event[]>
  joinEvent(id: string): void
  leaveEvent(id: string): void
}

// 🟢 GOOD (Related operations grouped)
interface EventSearcher {
  searchEvents(query: string): Promise<Event[]>
}

interface EventAttendance {
  joinEvent(id: string): void
  leaveEvent(id: string): void
}

interface EventLoader {
  loadEvent(id: string): Promise<Event>
  loadEvents(): Promise<Event[]>
}
```

We can also apply compositional patterns much easier with the later option, for instance.

```ts
// 🍆 BONUS (Composition)
class AlgoliaEventsSearcher implements EventsSearcher {
  private algolia: AlgoliaInstance
  // ...
}

class CacheableEventsSearcher implements EventsSearcher {
  private baseSearcher: EventsSearcher
  private cache = new Map<string, Event[]>()
  // ...

  async searchEvents(query: string) {
    if (this.cache[query]) return this.cache[query]
    const events = await this.baseSearcher.searchEvents(query)
    this.cache[query] = events
    return events
  }
}

class AnalyticsSendingEventsSearcher implements EventsSearcher {
  private baseSearcher: EventsSearcher
  private analytics: AnalyticsClient
  // ...

  async searchEvents(query: string) {
    this.analytics.send("EVENT_SEARCH", { query })
    return await this.baseSearcher.searchEvents(query)
  }
}
```

As we can see, searching is a complex operation with many steps, and so breaking it down this way makes it easier to change any of the moving parts. We can do the same for the `EventLoader` and `EventAttendance` interfaces as needed.

## Modules, Importing, and Exporting

### Rule 1: What is a module?

A folder of code or a literal node module.

### Rule 2: There are only 2 kinds of modules

A module must either be:

1. A particular set of code that is very interconnected (Interconnected module).
   1. Features
2. A set of code which is less interconnected but generic (Generic Module). 1. Utils
   It cannot be both.

### Rule 3: Interconnected Modules should include an index.ts file

Since the contents of the module are interconnected, it’s best that we have an index.ts file such that we can import it easily.

```
// 🔴 BAD
chat
	ChatRoom.tsx
	ChatClient.ts
	ChatMessage.ts

// 🟢 GOOD
chat
	ChatRoom.tsx
	ChatClient.ts
	ChatMessage.ts
	index.ts
```

The index.ts file should simply export everything that should be exposed from the module.

```ts
// In chat/index.ts

export * from "./ChatRoom"
export * from "./ChatClient"
// Use the brackets if you only want to export some
// things from a module and not everything
export { ChatMessage } from "./ChatMessage"
```

Doing this allows us to import things in a much more succinct way.

```ts
// 🔴 BAD (No index.ts)
import { ChatMessage } from "@chat/ChatMessage"
import { ChatRoomView } from "@chat/ChatRoom"

// 🟢 GOOD
import { ChatMessage, ChatRoomView } from "@chat"
```

### Rule 4: Generic modules must not include an index.ts file

Since generic modules mostly contain utilities that are unrelated to one another, we lose a lot of context when we import we have to import with a unified namespace.

```ts
// In utils/String.ts
export const isEmpty = (s: string) => s.length === 0

// In utils/Math.ts
export const sin2 = (radians: number) => (1 - Math.cos(2 * radians)) / 2

// 🔴 BAD
import { isEmpty, sin2 } from "@utils"

// 🟢 GOOD
import { isEmpty } from "@utils/String"
import { sin2 } from "@utils/Math"
```

### Rule 5: Avoid default exports at all costs

Default exports often don’t get good autocompletion support, and oftentimes the LSP finds it hard to auto import such exports. Additionally, default exports can be named whatever they want without an explicit `as` alias, so just use non-default exports instead.

```ts
// 🔴 BAD
const funcBad = () => {}
export default funcBad

// 🟢 GOOD
export const funcBad = () => {}
```

In some cases however, tools like storybook require default exports, so you have no choice there.

### Rule 6: Related utility functions in generic modules should share a namespace

This makes it easy in the code to see what type a particular utility acts on, as sometimes it’s not so clear.

```ts
// In utils/String.ts

// 🔴 BAD
export const isEmpty = (s: string) => s.length === 0

export const capitalizeFirst = (s: string) => {
  return s[0].toUpperCase() + s.slice(1)
}

// 🟢 GOOD
export namespace StringUtils {
  export const isEmpty = (s: string) => s.length === 0

  export const capitalizeFirst = (s: string) => {
    return s[0].toUpperCase() + s.slice(1)
  }
}
```

## General Naming Rules

### Rule 1: Names should be descriptive and meaningful

Names should actually say what something is actually doing and **what it means**. Let’s use the example of a common button component that we need to make for the app.

```ts
// 🔴 BAD (What does "CustomButton" mean?)
const CustomButton = () => {}

// 🟢 GOOD
const PrimaryButton = () => {}
```

### Rule 2: Don’t be afraid of more verbose/contextual names

If you can make a name “that” much easier to understand by adding another word, don’t hesitate, any context helps.

```ts
export namespace StringUtils {
  // 🔴 BAD (What is meant by "first")
  export const capitalizeFirst = (s: string) => {
    return s[0].toUpperCase() + s.slice(1)
  }

  // 🟢 GOOD (Ok first === letter)
  export const capitalizeFirstLetter = (s: string) => {
    return s[0].toUpperCase() + s.slice(1)
  }
}
```

## Commenting and Documentation

### Rule 1: Every exported public facing function, method, class, type, variable, etc. should have a documentation comment

Unless it is literally absolutely simple (like a constant named `MILES_PER_METER`), documentation comments can explain far more than a simple name.

```ts
export namespace StringUtils {
  // 🔴 BAD
  export const capitalizeFirstLetterBad = (s: string) => {
    if (s.length === 0) return ""
    return s[0].toUpperCase() + s.slice(1)
  }

  // 🟢 GOOD (Documents edge case)
  /**
   * Capitalizes the first letter of a given string.
   *
   * If the string is empty, an empty string is returned.
   */
  export const capitalizeFirstLetterGood = (s: string) => {
    if (s.length === 0) return ""
    return s[0].toUpperCase() + s.slice(1)
  }
}
```

### Rule 2: Non-documentation comments are only for “why” a decision was made

Additionally those comments must be prefixed with `NB:` such that they can be distinguished easily. Comments that explain “what” something is doing should either be hidden with a good name, or be documentation comments.

```ts
// 🔴 BAD
const funcBad = () => {
  // Add 1 and 1
  return 1 + 1
}

// 🔴 BAD (Include the NB: )
const funcBad = () => {
  // We add 1 + 1 because doing so allows us to avoid
  // being banished by Alfaðör, the god of destruction
  return 1 + 1
}

// 🟢 GOOD
const funcGood = () => {
  // NB: We add 1 + 1 because doing so allows us to avoid
  // being banished by Alfaðör, the god of destruction
  return 1 + 1
}
```

### Rule 3: Prefer good names over comments

So that dev tools (eg. Compilers, Editors) can recognize the good name, and not our heads.

```ts
// 🔴 BAD
const DISTANCE = 1609.344 * 5 // 5 Miles in meters

// 🟢 GOOD
const FIVE_MILES = METERS_PER_MILE * 5
```

### Rule 4: Code is not self-documenting

Research shows that the “self-documenting code” argument is really just a facade for “we are too lazy to write documentation”.

The reality is that we need **both** descriptive names, documentation, and comments.

## Dependency Injection

### Rule 1: Use it to control dependencies and write more modular code

Dependency injection is not only a tool for allowing us to substitute implementations for testing and UI prototyping, but it also allows us to write more generic code.

```ts
// 🔴 BAD
class BadChunkedMessageSender {
  // Chunking logic...
  async send(message: string) {
    await Ably.channels.get("channel").publish("THING", message)
  }
}

// 🟢 GOOD (We can swap implementations at any time without breaking the Chunking logic)
interface MessagePublisher {
  publish(event: string, message: string): Promise<void>
}

class AblyMessagePublisher implements MessagePublisher {
  // ...
}

class GoodChunkedMessageSender {
  private publisher: MessagePublisher

  // Chunking logic...

  constructor(publisher: MessagePublisher) {
    this.publisher = publisher
  }

  async send(message: string) {
    await this.publisher.publish("THING", message)
  }
}
```

### Rule 2: Use parameter injection if a class does not “embody” a dependency

Constructor injection is great when a class embodies an entire dependency such an `EventLoader` utilizing a `SQLiteConnection` to perform its operations. But often times, a class only needs a dependency to perform 1 operation. In such cases parameter injection is preferable.

```ts
interface TextStorage {
  save(text: string): void
}

// 🔴 BAD (We have to have an instance of TextStorage if we only need the filtering capabilties)
class BadTextState {
  private _text = ""
  private storage: TextStorage

  constructor(storage: TextStorage) {
    this.storage = storage
  }

  public get text() {
    return this._text
  }

  // Doesn't use the text storage at all
  public filter() {
    this._text.replace("fuck", "****")
  }

  public save() {
    this.storage.save(this._text)
  }
}

// 🟢 GOOD (We only need the storage for saving)
class GoodTextState {
  private _text = ""

  public get text() {
    return this._text
  }

  public filter() {
    this._text.replace("fuck", "****")
  }

  public save(storage: TextStorage) {
    storage.save(this._text)
  }
}
```

## Objects

### Rule 1: Use naming shorthand

Reduces unnecessary text.

```ts
const text = "Hello"

// 🔴 BAD
const bad = { text: text }

// 🟢 GOOD
const good = { text }
```

### Rule 2: Don’t use string keys in non-generic code

The `.` syntax is loved by editors.

```ts
const obj = { text: "Hello world" }

// 🔴 BAD
obj["text"]

// 🟢 GOOD
obj.text
```

### Rule 3: Avoid string object keys

If you need to use strings as keys, use a `Map`. Otherwise, we can only access the keys using the already banned string syntax.

```ts
// 🔴 BAD
const bad = { "Hello World": 1 }

// 🟢 GOOD
const good = { helloWorld: 1 }
```

### Rule 4: Don’t use objects when dealing with a dynamic number of keys/deleting keys

Use a `Map` for this instead, it’s much more optimized.

```ts
// 🔴 BAD
const playWithBadObj = (obj: object) => {
  obj["hello"] = "world"
  delete obj.text
}

// 🟢 GOOD
const playWithBadObj = (map: Map<string, string>) => {
  map.set("hello", "world")
  map.delete("text")
}
```

### Rule 5: Prefer spread syntax over `Object.assign`

`Object.assign` mutates the existing object, where as the spread creates a shallow copy and is more concise.

```ts
const obj = { a: 1 }

// 🔴 BAD (Mutates obj)
const bad = Object.assign(obj, { b: 2 })

// 🟢 GOOD
const good = { ...obj, b: 2 }
```

There is one exception, and that is in performant code. The spread syntax is very slow, so avoid it when performance is needed.

```ts
// 🟡 EXCEPTION (Performant Code)
const performant = () => {
  const obj = {
    /* ... */
  }
  for (let i = 0; i < 1_000_000; i++) {
    obj = Object.assign(obj, { a: i })
  }
  return obj
}
```

## Testing

### Rule 1: Test your code

Yes.

### Rule 2: Coverage that matters > 100% Coverage

100% coverage is nice in many situations, but in others it’s either unnecessary or not practical to achieve. In other words, make sure the code coverage that you do have matters, whether or not it’s 100% or 20%.

However, in many cases, such as when writing complex algorithms or libraries. The **coverage that matters** is in fact 100%.

On the flip side, if what you’re mostly testing is framework glue code, then you can leave that test coverage to the framework authors.

### Rule 3: Don’t test what has already been tested

You don’t need to test code that has already been tested extensively in other areas. This often happens with 3rd party libraries.

```ts
import { z } from "zod"

const ObjectSchema = z.object({
  name: z.string().max(50)
})

// 🔴 BAD
describe("ObjectSchema tests", () => {
  it("should not allow names more than 50 characters", () => {
    // Asserstions...
  })
})

// 🟢 GOOD (This test is a waste of time, since the
// zod maintainers have already done this job...)
```

### Rule 4: All tests should be wrapped in a `describe` block

This makes it easy to just run a specific suite of tests from the command line. Additionally, the format of the `describe` block name should be `"SystemUnderTest tests"`.

```ts
// 🔴 BAD
test("it works", () => {
  // Assertions...
})

// 🔴 BAD (Wrongly formatted describe block name)
describe("SystemUnderTest", () => {
  // ...
})

// 🟢 GOOD
describe("SystemUnderTest tests", () => {
  test("the thing working", () => {
    // ...
  })
  //...
})
```

### Rule 5: Use `it` and `test` to make the test description read like english

Naturally your tests should read like English. Using either `it` or `test` to achieve this is fine, but just make sure that the name reads easily.

```ts
// 🔴 BAD
it("thing should contain the other thing", () => {
  // ...
})

// 🔴 BAD
test("should contain the other thing", () => {
  // ...
})

// 🟢 GOOD
it("should contain the other thing", () => {
  // ...
})

// 🟢 GOOD
test("that the thing should contain the other thing", () => {
  // ...
})
```

### Rule 6: 1 concept per test

Large tests with many assertions tend to break more easily. Keep it succinct and the test should read easily.

```ts
// 🔴 BAD
test("it works", () => {
  const setup1 = ""
  const setup2 = 0
  // ...

  const a = complexLogic1()
  const alienGod = summonAlienGod()
  complexLogic2()
  destroyTheUniverse()
  // ...

  expect(a).toEqual("lmao")
  expect(theUniverse).toHaveBeenDestroyed()
  expect(alienGod).toMatchObject({})
  // ...
})

// 🟢 GOOD

test("complex logic 1", () => {
  const setup = ""
  const a = complexLogic1()
  expect(a).toEqual("lmao")
})

it("should summon the alien god", () => {
  // ...
})

// ...
```

### Rule 7: Limit the number of mocks per test

Mocks are a necessary evil, as they make testing much harder. So we should try to limit them as much as possible as they can make tests brittle. An ideal test has no mocks, but they still are a necessary evil in order to be able to unit test side effects in our system.

Many of the rules in this guide should already help to limit the number of mocks needed, but here are a few strategies to reducing the number of mocks.

#### 1. Split code into smaller units of code

The more dependencies a code has, the more you need to mock, and thus the more brittle the code because any of its many dependencies can change at any time.

```ts
// 🔴 BAD
class Thing {
  private readonly dependency1: SomeInterface
  private readonly dependency2: SomeInterface2
  private readonly dependency3: SomeInterface3
  // More dependencies...

  constructor(
    dependency1: SomeInterface,
    dependency2: SomeInterface2,
    dependency3: SomeInterface3
    // More dependencies...
  ) {
    // ...
  }
}

// 🟢 GOOD
class ThingA {
  private readonly dependency1: SomeInterface

  constructor(dependency1: SomeInterface) {
    // ...
  }
}

class ThingB {
  private readonly dependency2: SomeInterface2

  constructor(dependency2: SomeInterface2) {
    // ...
  }
}

class ThingC {
  private readonly dependency3: SomeInterface3

  constructor(dependency3: SomeInterface3) {
    // ...
  }
}
```

#### 2. Utilize parameter injection

This prevents having to create mocks that aren’t even used in some tests.

```ts
interface TextStorage {
  save(text: string): void
}

// 🔴 BAD (We have to have an instance of TextStorage if we only need to test the filtering capabilties)
class BadTextState {
  private _text = ""
  private storage: TextStorage

  constructor(storage: TextStorage) {
    this.storage = storage
  }

  public get text() {
    return this._text
  }

  // Doesn't use the text storage at all
  public filter() {
    this._text.replace("fuck", "****")
  }

  public save() {
    this.storage.save(this._text)
  }
}

describe("BadTextState tests", () => {
  it("should filter nothing when empty", () => {
    // We need to mock the text storage even it it's
    // not needed for testing filter
    const textState = new BadTextState(new MockTextStorage())
    textState.filter()
    // ...
  })
})

// 🟢 GOOD (We only need the storage for testing save)
class GoodTextState {
  private _text = ""

  public get text() {
    return this._text
  }

  public filter() {
    this._text.replace("fuck", "****")
  }

  public save(storage: TextStorage) {
    storage.save(this._text)
  }
}

describe("GoodTextState tests", () => {
  it("should filter nothing when empty", () => {
    // No mock needed
    const textState = new BadTextState()
    textState.filter()
    // ...
  })
})
```

#### 3. Separate pure code from non-pure code

In this case, **pure code**, will refer to code that doesn’t need mocks. If the main thing that you’re trying to test is how something is processed rather than how it’s loaded, then it’s best to isolate just the processing and test that.

```ts
type LargeThing = {}

// 🔴 BAD
const performActionBad = async (load: () => Promise<LargeThing>) => {
  const thing = await load()
  // Complex processing logic...
}

// 🟢 GOOD
const loadThing = async () => {
  // Load the thing...
}

const performActionGood = (thing: LargeThing) => {
  // Complex processing logic...
}
```

In the above case, you may still choose to test `loadThing`, or if it’s just framework glue code, then you probably could just ignore it. It all depends on the context. Regardless, you should definitely test `performActionGood` as it does some complex stuff. Thankfully, you can do so without a mock.

### Rule 8: Never mock modules directly

Mocking modules is not only tedious, but it’s also a huge implementation detail leak. This will cause your tests to break far down the line if we need to switch the implementation or service provider we need to use.

Instead, use dependency injection

```ts
import Ably from "ably"

const ably = new Ably.Realtime.Promise(ABLY_API_KEY)

// 🔴 BAD
const sendMessageBad = async (message: string) => {
  await ably.channels.get("channel").publish("event", message)
  // ...
}

// Don't do this
jest.mock("ably")

describe("SendMessageBad tests", () => {
  it("should send a message", () => {
    // ...
  })
})

// 🟢 GOOD
const sendMessageGood = async (
  message: string,
  // Default implementation is ably
  sendWithEvent: <Data>(
    event: string,
    data: Data
  ) => Promise<void> = ablySendWithEvent
) => {
  await sendWithEvent("event", message)
  // ...
}

const ablySendWithEvent = async <Data>(event: string, data: Data) => {
  await ably.channels.get("channel").publish(event, message)
}

describe("SendMessageGood tests", () => {
  it("should send a message", () => {
    const sender = jest.fn()
    await sendMessageGood("hello", sender)
    expect(sender).toHaveBeenCalledWith("event", "hello")
  })
})
```

### Rule 9: Use a hand-rolled stub for interface mocks

While you can construct an interface using normal object syntax, this can make tests brittle as you’re effectively chugging many mocks into 1. Instead, use a hand rolled stub such that if the interface changes, then the tests don’t break.

```ts
interface Connector {
  connect(): void
  disconnect(): void
}

const withConnection = (connector: Connector, perform: () => void) => {
  // ...
}

// 🔴 BAD
describe("BadWithConnection tests", () => {
  it("should connect and disconnect", () => {
    const connect = jest.fn()
    const disconnect = jest.fn()
    withConnection({ connect, disconnect }, () => {})
  })
})

// 🟢 GOOD (This may do more/other things than just counting function calls)
class MockConnector implements Connector {
  connectCount = 0
  disconnectCount = 0

  connect() {
    connectCount++
  }

  disconnectCount() {
    disconnectCount++
  }
}

describe("GoodWithConnection tests", () => {
  it("should connect and disconnect", () => {
    // This doesn't break when the Connector interface changes
    const connector = new MockConnector()
    withConnection(connector, () => {})
    // ...
  })
})
```

### Rule 10: Treat you test code the same as production code

Test code is code, it should be handled with care. Tests are not an excuse to have blatant duplication, or a path to violate any of the standards outlined here. This means performing regular maintenance on test code the same way you would production code.

### Rule 11: TDD or no TDD, do what you please

While the author of this style guide enjoys using TDD, there’s no way to even reasonably enforce it, unless we install employee monitoring software. As long as the resulting code is modular, well-tested, etc. then there isn’t a reason to change your process. Do what works for you, as this argument is overall a waste of time.

## React/React Native

### Rule 1: React is _only_ for the UI

React is a UI framework (which is fundamentally different from a library) due to its non-contradictory Stateful Functional Procedural paradigm that it enforces on the developer. React does not handle business logic, data fetching, etc. it only handles how the UI looks and the basic logic behind screens (eg. Is this button toggled).

While libraries like react-query provide tools to fetch data inside components, they don’t prescribe how the data is fetched or processed itself. That fetching and processing logic should be nowhere near a react component or hook.

```ts
import { useQuery } from "react-query"

// 🔴 BAD
const useUserBad = () => {
  return useQuery(["query", "key"], async () => {
    const data = await fetch("https://www.restapi.com/user")
    const user = (await data.json()) as User
    //  Do some processing on the user and return the result...
  })
}

// 🟢 GOOD

// NB: This function should also probably live inside a
// different file for anything non-trivial
const apiFetchUser = async () => {
  const data = await fetch("https://www.restapi.com/user")
  const user = (await data.json()) as User
  //  Do some processing on the user and return the result...
}

const useUserGood = (fetchUser: () => Promise<User> = apiFetchUser) => {
  return useQuery(["query", "key"], async () => await fetchUser())
}
```

With the good example, we can change how the data is fetched and processed without changing the UI code. Additionally, we can test the fetching/processing logic without having the overhead of the React Testing Library, which makes testing async code a lot harder than calling an async function.

Above all else remember this, React is a framework for building stateful and reactive user interfaces, not entire apps. Think through if the code you’re writing is UI code, or general logic. Only the former belongs inside react.

### Rule 2: Every exported component that renders UI directly should have an optional style prop

A good user experience shows familiar elements throughout its user interface. Despite that, these elements are used in different contexts, and happen to change **a lot**. Adding a style prop to any component that renders UI makes it much easier to use in many different contexts.

```tsx
// 🔴 BAD
export type BadComponentProps = {
  name: string
  // No style prop
}

// 🟢 GOOD
import { StyleProp, ViewStyle } from "react-native"

export type GoodComponentProps = {
  name: string
  style?: StyleProp<ViewStyle>
}
```

### Rule 3: An exported component should also export its props

This makes it possible compose component props, and/or transform them in cases of generic components.

```ts
// 🔴 BAD
type Props = {
  // ...
}

// 🟢 GOOD
export type PrimaryButtonProps = {
  // ...
}
```

### Rule 4: A component’s name that renders UI directly should end in `View`

This often makes it easy to tell if it’s something that involves UI, over a context provider.

```tsx
// 🔴 BAD
const FriendsList = () => {
  // jsx...
}

// 🟢 GOOD
const FriendsListView = () => {
  // jsx...
}
```

However, there may be an exception for commonly known UI element names such as progress bars, loading spinners, or buttons.

```tsx
// 🟡 EXCEPTION (Component is a common UI element that
// has prior art like a button)
const PrimaryButton = () => {
  // jsx...
}
```

### Rule 5: A component’s props should match its name

This of course makes it easy to see what view the props belong to. You can also emit the `View` suffix as the type is for `Props` and not a `View`.

```tsx
const TextEditorView = () => {
  // jsx...
}

// 🔴 BAD
type Props = {
  // ...
}

// 🟢 GOOD
type TextEditorProps = {
  // ...
}
```

### Rule 6: A component should be as dumb as possible

A component should only be for rendering UI directly as react has a concept for handling UI logic called hooks. Use hooks (hahaha I said the `useThing`) to extract any UI logic out of your components as it makes the logic more modular (which may or may not have additional benefits of making it easier to test), and we can change it without changing the UI (unless we change the hook’s interface).

```tsx
import { useState } from "react"
import { View } from "react-native"

type TextEditorProps = {
  style?: StyleProp<ViewStyle>
}

// 🔴 BAD
const BadTextEditorView = ({ style }: TextEditorProps) => {
  const [text, setText] = useState("")
  const [cursorPosition, setCursorPosition] = useState(0)

  const complexLogicWithTextAndCursor = () => {
    // ...
  }

  // Many more useStates and other random hooks...
  return <View style={style}>{/* Components */}</View>
}

// 🟢 GOOD
const useTextEditor = () => {
  const [text, setText] = useState("")
  const [cursorPosition, setCursorPosition] = useState(0)

  const complexLogicWithTextAndCursor = () => {
    // ...
  }
  // More hooks and UI logic...
}

const GoodTextEditorView = ({ style }: TextEditorProps) => {
  const { text, cursorPosition } = useTextEditor()
  return <View style={style}>{/* Components */}</View>
}
```

A good rule of thumb to follow is that if a button in a view needs to have more than a couple lines of code for its `onPress`, then you probably have too much logic in the component.

Another good rule of thumb is to limit the amount of 3rd party library types returned from hooks, as this can cause additional logic to be used in the view to make them “presentable”.

### Rule 7: Context is for dependency injection, not state management

React context allows components to share values without needing props. This is great for things that don’t change, like the current user, or an interface to interact with the user’s events, but doesn’t work well `useState` . This is because a single change to the state will most likely rerender every component that has a `useContext` that relates to the context that the state is involved in. There are a plethora of state management libraries out there, like jotai. However, to be honest you should try avoiding the problem of global shared state anyways as it makes programming harder in general.

```ts
import { createContext } from "react"

type ThingProviderProps = {
  children: JSX.Element
}

const ThingContext = createContext({})

// 🔴 BAD
const BadThingProvider = ({ children }: ThingProviderProps) => {
  const [state, setState] = useState("")
  const loadUser = () => {
    // ...
  }
  // Other context values and jsx...
}

// 🟢 GOOD (Remove useState from context)
const GoodThingProvider = ({ children }: ThingProviderProps) => {
  const loadUser = () => {
    // ...
  }
  // Other context values and jsx...
}
```

### Rule 8: Always wrap contexts in custom provider components and hooks

Context is an implementation detail of how the values are propagated to other components. We shouldn’t try to expose it and instead clarify our intentions clearly.

```tsx
import { createContext, useContext } from "react"

const ThingContext = createContext({})

// 🔴 BAD
const BadParentView = () => {
  const value = 1
  return (
    <ThingContext.Provider value={value}>
      <BadChildView />
    </ThingContext.Provider>
  )
}

const BadChildView = () => {
  const value = useContext(ThingContext)
  // ...
}

// 🟢 GOOD
type ThingProviderProps = {
  children: JSX.Element
}

const ThingProvider = ({ children }: ThingProviderProps) => {
  const value = 1
  return (
    <ThingContext.Provider value={value}>
      <BadChildView />
    </ThingContext.Provider>
  )
}

const useThing = () => useContext(ThingContext)

const GoodParentView = () => (
  <ThingProvider>
    <GoodChildView />
  </ThingProvider>
)

const GoodChildView = () => {
  const value = useThing()
  // ...
}
```

### Rule 9: Compute state whenever possible

`useState` allows us to create Stateful and Procedural ~~objects~~ functions, but in order for its value to change we have to call a setter. We should avoid this whenever possible, because `useState` also causes the view to rerender. Not only that, but when we have `useState` values that can easily be computed from other `useState` values or variables, we also risk forgetting to manually keep the states in sync.

```ts
import { useState } from "react"

// 🔴 BAD
const useBad = () => {
	const [name, setName] = useState("")
	const [isValidName, setIsValidName] = useState(false)
	return {
	  name,
	  isValidName,
	  updateName: (name: string) {
		setName(name)
		if (name.length > 0) {
		  setIsValidName(true)
		}
	  }
	}
}

// 🟢 GOOD
const useGood = () => {
	const [name, setName] = useState("")
	return {
	  name,
	  isValidName: name.length > 0,
	  updateName: setName
	}
}
```

Yes, this means that `isValidName` is recomputed on every render. For trivial calculations, this is fine, but what if the calculation is slow like when we need to calculate an array of 1 billion lexicographically sorted strings.

Well, that’s where `useMemo` comes in. It caches the calculated value as long as its dependencies (the `useState` values that were used to compute it) don’t change.

```ts
import { useState, useMemo } from "react"

// 🍆 Use useMemo to only compute an array of
// lexicographically sorted strings when num changes
const useMemoExample = () => {
  const [num, setNum] = useState(1_000_000_000)
  const sortedStrings = useMemo(
    () => createLexicographicallySortedStrings(num),
    [num]
  )
  // ...
}
```

### Rule 10: Avoid `useEffect` as much as possible

`useEffect` is the leading cause of death for react programmers. Since it needs 4 articles in its official documentation to tell you how to avoid all of its pitfalls, it’s honestly just better to avoid it as much as possible. Instead, libraries like react query do a great job at managing it for you.

### Rule 11: Avoid non-primitive type keys in `useEffect` as much as possible

When you have no other choice but to use `useEffect`, you have to watch what types of keys you use. `useEffect` uses javascript equality mechanism to check when it should refire, which is better explained as what the fuck.

```ts
const a = { value: 1 }
const b = { value: 1 }
console.log(a === b) // false
console.log(b === a) // fale
console.log(a === a) // true
console.log(b === b) // true

const c = [1, 2, 3]
const d = [1, 2, 3]
// The same results for c and d as a and b
```

What you see above applies to any type that are not:

1. `string`
2. `number`
3. `boolean`
4. `undefined`
5. `null`

This means that using an object or an array as a dependency key will retrigger the `useEffect` body as long as its memory address changes.

```ts
import { useState, useEffect } from "react"

// 🔴 BAD (Destroys the universe on every render)
const useBad = () => {
  const value = { a: 1 }
  useEffect(() => {
    destroyTheUniverse(value)
  }, [value])
  // ...
}

// 🔴 BAD (This is a hack, the effect is never retriggered
// because the memory address of value stays the same
// across renders)
const useSomewhatOk = () => {
  const [value, setValue] = useState({ a: 1 })
  useEffect(() => {
    destroyTheUniverse(value)
  }, [value])
  // ...
}
```

Unfortunately, it’s probably impossible to avoid object or array query keys in every scenario, so if you really have to then make sure that the key comes from a `useState`, `useMemo`, `useCallback`, or anything else that preserves its memory address.

### Rule 12: Read the `useEffect` documentation

Just do it, they outline everything you need to know and how to best `useIt`. [useEffect – React](https://react.dev/reference/react/useEffect#removing-unnecessary-object-dependencies)

## 3rd Party Libraries/Dependencies

### Rule 1: Ensure the library is well maintained, tested, etc.

NPM hosts a wide-range of javascript packages which are delightfully full of bugs or lack any sort of tests whatsoever. That being said, make sure you thoroughly review the source code of any 3rd party library before bringing it on.

### Rule 2: You don’t need a library or dependency for problems you can solve yourself easily

Libraries/Dependencies are great when they solve a complex issue such as managing a system of UI components that are derived from state. But if all you need to do is build a simple toast component, just build the toast component yourself.

A good rule of thumb is to only bring in a library if it takes more than a few hundred lines of code or a lot effort to do it yourself,.

### Rule 3: Isolate references to 3rd party types as much as possible

The 3rd party code is an implementation detail of the system, not **the system** itself. We may want to use a different library later if our needs change, so it’s best to isolate the use of their types as much as possible.

```ts
import { AWSUser } from "aws-cognito"

// 🔴 BAD
const processUserBad = (user: AWSUser) => {
  // ...
}

// 🟢 GOOD (Make our own user type, and bend AWS to it)
type User = {
  // ...
}

const awsUserToUser = (awsUser: AWSUser): User => {
  // Convert to our custom user type...
}

const processUserGood = (user: User) => {
  // ...
}
```

## Miscellaneous Guidelines

Since these are guidelines that cannot be categorized, there are no rule numbers here.

### Use Zod to validate types

Zod is a powerful validation library that provides type safe validation and parsing.

```ts
import AsyncStorage from "@react-native-async-storage/async-storage"

// 🔴 BAD
type BadUser = {
  name: string
  age: number
}

const loadBadUser = async () => {
  return JSON.parse(await AsyncStorage.getItem("@USER")) as BadUser | undefined
}

// 🟢 GOOD (Ensures it's valid user data)
import { z } from "zod"

const GoodUserSchema = z.object({
  name: z.string().min(1),
  age: z.number().positive()
})

type GoodUser = z.infer<typeof GoodUserSchema>

const loadGoodUser = async () => {
  const data = JSON.parse(await AsyncStorage.getItem("@USER"))
  return await GoodUserSchema.parse(data)
}
```

### Use react query for data fetching in hooks

It handles caching, state management, retries, etc. Use it over your crappy version of `useEffect`.

```ts
// 🔴 BAD
import { useState, useEffect } from "react"

const useBad = (loadString: () => Promise<string>) => {
  const [string, setString] = useState<string | undefined>()
  const [error, setError] = (useState < Error) | undefined()
  useEffect(() => {
    loadString().then(setString).catch(setError)
  }, [])

  // ...
}

// 🟢 GOOD
import { useQuery } from "react-query"

const useGood = (loadString: () => Promise<string>) => {
  return useQuery(["string"], async () => await loadString())
}
```
