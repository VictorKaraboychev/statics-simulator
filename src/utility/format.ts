export const METRIC_PREFIXES = [
	{ exp: -18, symbol: 'a' },
	{ exp: -15, symbol: 'f' },
	{ exp: -12, symbol: 'p' },
	{ exp: -9, symbol: 'n' },
	{ exp: -6, symbol: 'µ' },
	{ exp: -3, symbol: 'm' },
	{ exp: -2, symbol: 'c' },
	{ exp: 0, symbol: '' },
	{ exp: 3, symbol: 'k' },
	{ exp: 6, symbol: 'M' },
	{ exp: 9, symbol: 'G' },
	{ exp: 12, symbol: 'T' },
	{ exp: 15, symbol: 'P' },
	{ exp: 18, symbol: 'E' },
];

/**
 * Formats a number in engineering notation.
 * @param value Number to format.
 * @param baseUnit Base unit of the number.
 * @param precision Number of decimal places to round to.
 * @returns 
 */
export const fEngineering = (value: number, baseUnit: string, precision: number = 2): string => {
	const exponent = Math.floor(Math.log10(Math.abs(value)))
	const prefix = METRIC_PREFIXES.findLast((p) => exponent >= p.exp)

	if (!prefix) return `${value} ${baseUnit}`

	const roundedValue = (value / 10 ** prefix.exp).toFixed(precision)
	return `${roundedValue} ${prefix!.symbol}${baseUnit}`
}