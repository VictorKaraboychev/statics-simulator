import { Vector2 } from "three"
import Joint from "../utility/truss/Joint"
import Connection from "../utility/truss/Connection"

export type DefaultTrussParamsType = {
	density: number,
	area: number,
	youngsModulus: number,
	ultimateStress: {
		tension: number,
		compression: number
	},
}

export type TrussJointDetailsType = {
	id: number,
	joint: Joint,
}

export type TrussConnectionDetailsType = {
	id: string,
	length: number,
	angle: number,
	connection: Connection,
	a: Joint,
	b: Joint,
}

export type JointJSONType = {
	id: string,
	position: [number, number]
	fixtures?: { x: boolean, y: boolean }
	externalForce?: [number, number]
	connections: { [id: string]: string }
}

export type ConnectionJSONType = {
	id: string,
	jointIds?: [string, string],
	stress: number,
	density: number,
	area: number,
	youngsModulus: number,
	ultimateStress: {
		tension: number,
		compression: number
	},
}

export type TrussJSONType = {
	joints: JointJSONType[],
	connections: ConnectionJSONType[]
}