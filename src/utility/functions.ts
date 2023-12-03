import { Vector2 } from "three"
import { round } from "./math"

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

/**
 * Scrolls the div by id or the main view to the provided position.
 * @param options  Scroll options.
 * @param id  Id of the div to scroll
 */
export const scrollTo = (options?: ScrollToOptions, id?: string) => document.getElementById(id ?? 'scroll-view')?.scrollTo(options)

export const setCursor = (cursor: string) => {
	if (document.body.style.cursor !== cursor) {
		document.body.style.cursor = cursor
	}
}

export const clearSelection = () => {
	if (window.getSelection) { 
		window.getSelection()?.removeAllRanges()
	}
}

export const equals = <T>(a: T, b: T): boolean => JSON.stringify(a) === JSON.stringify(b)

export const last = <T>(array: T[]): T => array[array.length - 1]

export const randInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min

export const roundVector2 = (vector: Vector2, decimals: number): Vector2 => {
	return new Vector2(round(vector.x, decimals), round(vector.y, decimals))
}
