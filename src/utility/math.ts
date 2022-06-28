import { Range } from "../types/general"

/**
 * Constrains a value within a given range.
 * @param value  Value to constrain.
 * @param range  Range to constrain the value to.
 * @returns  Constrained value.
 */
export const constrain = (value: number, range: Range) => {
	return Math.max(Math.min(value, range.max || value + 1), range.min || value - 1)
}

export const round = (value: number, decimals?: number) => {
	return Math.round(value * 10 ** (decimals || 0)) / 10 ** (decimals || 0)
}