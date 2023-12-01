import { DependencyList, Dispatch, EffectCallback, SetStateAction, useEffect, useRef, useState } from "react"
import { deepCopy } from './object'
import { Change, applyChanges, diff, revertChanges } from 'yajsondiff'

export const useEventEffect = <K extends keyof WindowEventMap>(listener: (this: Window, ev: WindowEventMap[K]) => any, type: K, deps?: DependencyList) => {
	useEffect(() => {
		window.addEventListener(type, listener)
		return () => window.removeEventListener(type, listener)
	}, deps)
}

export const useKeyEffect = (effect: EffectCallback, key: string) => {
	useEventEffect((e: KeyboardEvent) => {
		if (e.key === key) effect()
	}, 'keydown')
}

export function useReliantState<T>(initialState: T | (() => T), deps?: DependencyList): [T, Dispatch<SetStateAction<T>>]
export function useReliantState<T = undefined>(initialState?: T | (() => T), deps?: DependencyList): [T | undefined, Dispatch<SetStateAction<T | undefined>>]

export function useReliantState(initialState?: unknown, deps?: DependencyList): unknown {
	const [state, setState] = useState(initialState)

	useEffect(() => deps && setState(initialState), deps)

	return [state, setState]
}

export const useCompoundState = <T extends Object>(initialState: T | (() => T), deps?: DependencyList): [T, <K extends keyof T>(key: K) => (value: T[K]) => void, () => void] => {
	const [state, setState] = useReliantState(deepCopy(initialState), deps)

	const set = <K extends keyof T>(key: K) => (value: T[K]) => {
		state[key] = value
		setState({ ...state })
	}

	const reset = () => setState(initialState)

	return [state, set, reset]
}

export const usePersistentState = <T>(key: string, initialState?: T, storage: 'local' | 'session' = 'local'): [T, (value: T) => void] => {
	const storageType = storage === 'local' ? localStorage : sessionStorage
	const [state, setState] = useState((() => {
		const storage = storageType.getItem(key)
		return storage !== null ? JSON.parse(storage) : initialState
	})())

	useEffect(() => {
		storageType.setItem(key, JSON.stringify(state))
	}, [state])

	return [state, setState]
}

export const usePersistentRef = <T>(key: string, initialValue?: T, storage: 'local' | 'session' = 'local'): React.MutableRefObject<T> => {
	const storageType = storage === 'local' ? localStorage : sessionStorage
	const state = useRef<T>((() => {
		const storage = storageType.getItem(key)
		return storage !== null ? JSON.parse(storage) : initialValue
	})())

	useEffect(() => () => {
		storageType.setItem(key, JSON.stringify(state.current))
	}, [])

	return state
}

export const useHistory = <T>(key: string, initialState?: T, maxStates = 1000, storage: 'local' | 'session' = 'session'): [T | undefined, (newValue: T) => void, () => T | undefined, () => T | undefined, () => void] => {
	const savedState = usePersistentRef<{ undo: Change[][], redo: Change[][] }>(`history-${key}`, { undo: [], redo: [] }, storage)
	const [value, setValue] = useState<T | undefined>(initialState)

	const set = (newValue: T) => {
		const difference = diff(value, newValue)

		if (difference) {
			savedState.current.undo.push(difference)
			savedState.current.redo = []

			if (savedState.current.undo.length > maxStates) savedState.current.undo.shift()
		}

		setValue(newValue)
	}

	const undo = () => {
		const past = savedState.current.undo.pop()
		if (!past) return
		savedState.current.redo.push(past)

		const newValue = revertChanges(value, past)
		setValue(newValue)
		return newValue
	}

	const redo = () => {
		const future = savedState.current.redo.pop()
		if (!future) return
		savedState.current.undo.push(future)

		const newValue = applyChanges(value, future)
		setValue(newValue)
		return newValue
	}

	const clear = () => {
		savedState.current = { undo: [], redo: [] }
		setValue(initialState)
	}

	return [value, set, undo, redo, clear]
}