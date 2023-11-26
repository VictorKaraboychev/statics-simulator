import default_truss from '../data/default_truss.json'
import { DefaultTrussParamsType, TrussJSONType } from '../types/truss'

export const DEFAULT_TRUSS = default_truss as unknown as TrussJSONType

export const TRUSS_COLORS: { [key: string]: string } = {
	compression: '#00ff00',
	tension: '#ff0000',
	over_compression: '#87ff75',
	over_tension: '#fa87af',
}

export const DEFAULT_TRUSS_PARAMETERS: DefaultTrussParamsType = {
	density: 7850,
	area: 0.001,
	youngsModulus: 200e9,
	shearModulus: 75e9,
	poissonsRatio: 0.26,
	ultimateStress: {
		tension: 250e6,
		compression: 152e6
	},
}