import { Vector2 } from "three"
import Joint from "../utility/truss/Joint"

export type TrussDetailsType = {
	cost: number,
	maxCompression: number,
	maxTension: number,
}

export type TrussJointDetailsType = {
	id: number,
	joint: Joint,
}

export type TrussConnectionDetailsType = {
	id: string,
	force: number | null,
	stress: number,
	length: number,
	angle: number,
	multiplier: number,
	a: Joint,
	b: Joint,
}

export type JointJSONType = {
	position: [number, number]
	fixtures?: [number, number][]
	externalForce?: [number, number]
}

export type ConnectionJSONType = {
	force: number,
	density: number,
	area: number,
	youngsModulus: number,
	ultimateStress: { 
		tensile: number, 
		compressive: number
	},
}

export type TrussJSONType = {
	joints: JointJSONType[],
	connections: [number, number, ConnectionJSONType][]
}