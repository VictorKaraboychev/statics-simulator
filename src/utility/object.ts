/**
 * Creates a deep copy of an object.
 * @param object  Object to copy.
 * @returns  Deep copy of the object.
 */
export const deepCopy = <T>(object: T): T => JSON.parse(JSON.stringify(object))

/**
 * Gets the number of entries in an object.
 * @param object  Object to get length.
 * @returns  Number of entries in the object.
 */
export const objectLength = (object?: Object): number => object ? Object.keys(object).length : 0

/**
 * Checks if two objects are equal.
 * @param a First object.
 * @param b Second object.
 * @returns  Whether objects "a" and "b" are equal.
 */
export const equals = <T>(a: T, b: T): boolean => JSON.stringify(a) === JSON.stringify(b)

/**
 * Finds the key corresponding to a value in an object.
 * @param object Object to search.
 * @param value Value to find in the object.
 * @returns  The key of the value in the object or undefined if no value exists.
 */
export const getKeyByValue = <T extends Object, K extends keyof T>(object: T, value: T[K]): K | undefined => {
	return (Object.keys(object) as K[]).find((key) => object[key] === value)
}