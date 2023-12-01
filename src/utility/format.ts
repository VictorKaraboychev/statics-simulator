import { autoUnit } from "./math"

/**
 * Formats a number in engineering notation.
 * @param value Number to format.
 * @param baseUnit Base unit of the number.
 * @param precision Number of decimal places to round to.
 * @returns 
 */
export const fEngineering = (value: number, baseUnit: string, precision: number = 2): string => {
	const { value: baseValue, unit } = autoUnit(value, baseUnit)
	return `${baseValue.toFixed(precision)} ${unit}`
}

/**
 * Formats a number as a percentage.
 * @param value Number to format.
 * @param decimals Number of decimal places to round to.
 * @returns 
 */
export const fPercent = (value: number, decimals = 2): string => {
	return `${(value * 100).toFixed(decimals)}%`
}