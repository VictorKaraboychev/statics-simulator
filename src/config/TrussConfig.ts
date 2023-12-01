import default_truss from '../data/default_truss.json'
import { DefaultTrussParamsType, TrussJSONType } from '../types/truss'
import { FailureMode } from '../utility/truss/Connection'

export const DEFAULT_TRUSS = default_truss as unknown as TrussJSONType

export const TRUSS_COLORS: { [key: string]: string } = {
	compression: '#00dd00',
	tension: '#ff0000',
	buckling: '#0000ff',
}

export const FAILURE_MODES: { [key: number]: { label: string, color: string }} = {
	[FailureMode.NONE]: {
		label: 'None',
		color: '#000000',
	},
	[FailureMode.AXIAL_TENSION]: {
		label: 'Axial Tension',
		color: '#ff0000',
	},
	[FailureMode.AXIAL_COMPRESSION]: {
		label: 'Axial Compression',
		color: '#00dd00',
	},
	[FailureMode.BUCKLING]: {
		label: 'Buckling',
		color: '#0000ff',
	},
	[FailureMode.SHEAR]: {
		label: 'Shear',
		color: '#ffff00',
	},
}

export const DEFAULT_TRUSS_PARAMETERS: DefaultTrussParamsType = {
	simple: true,
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