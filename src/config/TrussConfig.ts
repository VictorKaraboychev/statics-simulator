import default_truss from '../data/default_truss.json'
import { TrussJSONType } from '../types/truss'

export const DEFAULT_TRUSS = default_truss as TrussJSONType

export const TRUSS_COLORS: { [key: string]: string } = {
	compression: '#00ff00',
	tension: '#ff0000'
}