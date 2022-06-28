/**
 * Creates a deep copy of an object.
 * @param object  Object to copy.
 * @returns  Deep copy of the object.
 */
export const deepCopy = <T>(object: T): T => {
	return JSON.parse(JSON.stringify(object)) // converts the object to JSON and back into an object
}


/**
 * Generates a v4 UUID.
 * @returns v4 UUID.
 */
export const getUUID = () => {
	return crypto.randomUUID()
}

export const equals = <T>(a: T, b: T): boolean => JSON.stringify(a) === JSON.stringify(b)

export const last = <T>(array: T[]): T => array[array.length - 1]

export const randInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min