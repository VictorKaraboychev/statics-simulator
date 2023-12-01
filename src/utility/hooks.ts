import { DependencyList, Dispatch, EffectCallback, SetStateAction, useEffect, useRef, useState } from "react"
import { deepCopy } from './object'

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
	const [state, setState] = useState(() => {
		const storage = storageType.getItem(key)
		return storage !== null ? JSON.parse(storage) : initialState
	})

	useEffect(() => {
		storageType.setItem(key, JSON.stringify(state))
	}, [state])

	return [state, setState]
}