export type Range = {
	min?: number
	max?: number
}

export type HoverState = 'accepted' | 'rejected' | 'none'

export type GridScaleType = {
	scale: number,
	base_unit: string,
}