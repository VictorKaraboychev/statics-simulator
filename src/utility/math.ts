import { Vector, Vector2, Vector3 } from 'three'
import { Range } from '../types/general'

/**
 * Checks if a value is within a given range.
 * @param value  Value to compare.
 * @param range  Range to compare the value to.
 * @returns  Whether the value in within the given range.
 */
 export const isWithin = (value: number, range: Range): boolean => {
	return 	(range.min === undefined || value >= range.min) && (range.max === undefined || value < range.max)
}

/**
 * Constrains a value within a given range.
 * @param value  Value to constrain.
 * @param range  Range to constrain the value to.
 * @returns  Constrained value.
 */
export const constrain = (value: number, range: Range) => {
	return Math.max(Math.min(value, range.max || value + 1), range.min || value - 1)
}

export const round = (value: number, decimals: number = 0) => {
	return Math.round(value * 10 ** decimals) / 10 ** decimals
}

export const roundVector = <T extends Vector>(vector: T, decimals: number = 0): T => {
	// @ts-ignore
	return vector.multiplyScalar(10 ** decimals).round().divideScalar(10 ** decimals)
}

// export const delay = new (ms: number) => {
// 	return
// }

export const delay = (ms: number) => new Promise<void>((resolve, reject) => {
	setTimeout(resolve, ms)
})

// export const delay = async (ms: number) => {
// 	setTimeout(()=> {true}, ms);

// }

export const countDecimals = (num: number) => {
    if (Math.floor(num.valueOf()) === num.valueOf()) return 0
    return num.toString().split('.')[1].length || 0
}

export const rangeCheck = (value: number, range: Range, def = 0) => {
	return isWithin(value, range) ? value : def
}