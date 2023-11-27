export type Range = {
	min?: number
	max?: number
}

export type HoverState = 'accepted' | 'rejected' | 'none'

export type GridScaleType = {
	scale: number,
	base_unit: string,
}

type RouteEndPoint = {
	component?: Promise<{ default: React.ComponentType<any> }>
	index?: boolean
	private?: boolean
	permissions?: string[]
}
export type RouteType = RouteEndPoint | ({ [label: string]: RouteType } & RouteEndPoint)
export type RouteWrapperType = { property: keyof RouteType, guard: (props: { value: any, children: ReactElement }) => ReactElement | null }[]

export interface ErrorFallbackInterface {
	error: Error
	resetErrorBoundary: () => void
}