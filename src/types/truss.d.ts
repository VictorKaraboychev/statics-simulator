export type TrussDetailsType = {
	cost: number,
	maxCompression: number,
	maxTension: number,
}

export type TrussConnectionDetailsType = {
	force: number | null,
	stress: number,
	length: number,
}