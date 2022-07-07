export type JointJSONType = {
	id: number
	position: [number, number]
	fixtures?: [number, number][]
	externalForce?: [number, number]
}