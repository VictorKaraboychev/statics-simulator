import { PaletteMode } from '@mui/material'
import { atom } from 'recoil'
import { DEFAULT_TRUSS, DEFAULT_TRUSS_PARAMETERS } from '../config/TrussConfig'
import { CustomAtom } from '../types/state.d'
import { DefaultTrussParamsType, TrussJSONType } from '../types/truss.d'
import { DEFAULT_GRID_SCALE } from '../config/GlobalConfig'
import { GridScaleType } from '../types/general'

export const customAtom = <T>(label: string, initial: T, mutability?: boolean): CustomAtom<T> => {
	return {
		state: atom({
			key: label,
			default: initial,
			dangerouslyAllowMutability: mutability || false
		}),
		initial
	}
}

const atoms = {
	theme: customAtom<PaletteMode | 'system'>('theme', 'light'),
	current_truss: customAtom<TrussJSONType>('current_truss', DEFAULT_TRUSS, true),
	saved_trusses: customAtom<TrussJSONType[]>('saved_trusses', []),
	grid_scale: customAtom<GridScaleType>('grid_scale', DEFAULT_GRID_SCALE),
	truss_constraints: customAtom<DefaultTrussParamsType>('truss_constraints', DEFAULT_TRUSS_PARAMETERS),
	truss_view: customAtom<string>('truss_view', 'default'),
}

export default atoms