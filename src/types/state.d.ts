import { RecoilState } from 'recoil'

export type CustomAtom<T> = {
	state: RecoilState<T>
	initial: T
}
