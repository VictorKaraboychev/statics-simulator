import { PaletteMode } from '@mui/material'
import { atom } from 'recoil'
import { DEFAULT_TRUSS, DEFAULT_TRUSS_CONSTRAINTS } from '../config/TrussConfig'
import { CustomAtom } from '../types/state'
import { TrussConstraintsType, TrussJSONType } from '../types/truss'

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
	truss_constraints: customAtom<TrussConstraintsType>('truss_constraints', DEFAULT_TRUSS_CONSTRAINTS),
	is_gen_running: customAtom<boolean>('is_gen_running', false),
	generation: customAtom<number>('generation', 0),
	cost_visible: customAtom<boolean>('cost_visible', true),
	truss_view: customAtom<string>('truss_view','default'),
}

export default atoms