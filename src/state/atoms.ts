import { PaletteMode } from '@mui/material'
import { atom } from 'recoil'
import { DEFAULT_TRUSS, DEFAULT_TRUSS_PARAMETERS } from '../config/TrussConfig'
import { CustomAtom } from '../types/state.d'
import { DefaultTrussParamsType, TrussJSONType } from '../types/truss.d'

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
	theme: customAtom<PaletteMode | 'system'>('theme', 'system'),
	current_truss: customAtom<TrussJSONType>('current_truss', DEFAULT_TRUSS, true),
	saved_trusses: customAtom<TrussJSONType[]>('saved_trusses', []),
	truss_constraints: customAtom<DefaultTrussParamsType>('truss_constraints', DEFAULT_TRUSS_PARAMETERS),
	truss_view: customAtom<string>('truss_view', 'default'),
}

export default atoms