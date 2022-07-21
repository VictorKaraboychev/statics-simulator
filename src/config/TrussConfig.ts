import default_truss from '../data/default_truss.json'
import { TrussConstraintsType, TrussJSONType } from '../types/truss'

export const DEFAULT_TRUSS = default_truss as TrussJSONType

export const TRUSS_COLORS: { [key: string]: string } = {
	compression: '#00ff00',
	tension: '#ff0000',
	over_compression: '#87ff75',
	over_tension: '#fa87af',
	under: '#8103ab',
	illegal: '#ffff00',
}

export const DEFAULT_TRUSS_CONSTRAINTS: TrussConstraintsType = {
	maxCompression: 0,
	maxTension: 0,
	distributedForce: 0,
	maxMultiplier: 1,
	minDistance: 0,
	connectionCost: 1,
	jointCost: 1,
}