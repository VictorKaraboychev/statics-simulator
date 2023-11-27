export type Range = {
	min?: number
	max?: number
}

export type HoverState = 'accepted' | 'rejected' | 'none'

export type EditorSettingsType = {
	scale: number,
	grid_enabled: boolean,
	snap_to_grid: boolean,
	debug: boolean,
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