import { DependencyList, Dispatch, EffectCallback, SetStateAction, useEffect, useState } from "react"

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