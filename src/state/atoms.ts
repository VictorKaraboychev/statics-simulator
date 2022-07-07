import { PaletteMode } from '@mui/material'
import { atom } from 'recoil'
import { DEFAULT_TRUSS, DEFAULT_TRUSS_CONSTRAINTS } from '../config/TrussConfig'
import { CustomAtom } from '../types/state'
import { TrussJSONType, TrussStressConstraints } from '../types/truss'

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
	truss_constraints: customAtom<TrussStressConstraints>('truss_constraints', DEFAULT_TRUSS_CONSTRAINTS),
}

export default atoms