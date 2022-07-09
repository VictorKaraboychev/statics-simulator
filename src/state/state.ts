import { useEffect } from 'react'
import { useRecoilState } from 'recoil'
import { CustomAtom } from '../types/state'
import Truss from '../utility/Truss'
import atoms from './atoms'

const createGlobalState = <T>(atom: CustomAtom<T>): { value: T, initial: T, set: (newValue: T) => void, reset: () => void } => {
	const [ value, set ] = useRecoilState(atom.state)

    const reset = () => set(atom.initial)
    
    return { value, initial: atom.initial, set, reset }
}

const createGlobalPersistentState = <T>(atom: CustomAtom<T>): { value: T, initial: T, set: (newValue: T, save?: boolean) => void, load: () => void, reset: () => void } => {
    const state = atom.state
    const { value, initial, set: setValue } = createGlobalState(atom)

	const key = `global-${state.key}`

    const load = () => {
		const loadValue = localStorage.getItem(key)
        setValue(loadValue ? JSON.parse(loadValue) : initial)
    }

    const set = (newValue: T, save = true) => {
        setValue(newValue)
        if (save) localStorage.setItem(key, JSON.stringify(newValue))
    }

    const reset = (save = true) => set(initial, save)

    return { value, initial, set, load, reset }
}

export const useStateManager = (handlePersistance = false) => {
	const properties: { reset?: () => void, load?: () => void, unload?: () => void, [key: string]: any }[] = []
	for (const key in useGlobalState) {
		properties.push(useGlobalState[key as keyof typeof useGlobalState]())
	}

	useEffect(() => {
        if (!handlePersistance) return

		console.log('STATE LOADED')
		for (const property of properties) {
			if (property.load) property.load()
		}
		return () => {
			console.log('STATE UNLOADED')
			for (const property of properties) {
				if (property.unload) property.unload()
			}
		}
	}, [])

    const globalReset = () => {
		for (const property of properties) {
			if (property.reset && property.load) property.reset()
		}
    }

    return { globalReset }
}

const useGlobalState = {
	theme: () => createGlobalPersistentState(atoms.theme),
	current_truss: () => {
		const { value: json, initial: initialJSON, set: setJSON, load, reset } = createGlobalPersistentState(atoms.current_truss)

		const value = Truss.fromJSON(json)
		value.compute()

		const set = (newValue: Truss, save = true) => setJSON(newValue.toJSON(), save)

		return { value, initial: Truss.fromJSON(initialJSON), set, load, reset }
	},
	saved_trusses: () => {
		const { value: json, initial: initialJSON, set: setJSON, load, reset } = createGlobalPersistentState(atoms.saved_trusses)

		const set = (newValue: Truss[], save = true) => setJSON(newValue.map((truss) => truss.toJSON()), save)

		return { value: json.map(Truss.fromJSON), initial: initialJSON.map(Truss.fromJSON), set, load, reset }
	},
	truss_constraints: () => createGlobalPersistentState(atoms.truss_constraints),
	is_gen_running: () => createGlobalState(atoms.is_gen_running),
	generation: () => createGlobalState(atoms.generation),
}

export default useGlobalState