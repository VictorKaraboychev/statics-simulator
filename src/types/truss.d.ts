import { Vector2 } from "three"
import Joint from "../utility/truss/Joint"
import Connection from "../utility/truss/Connection"

export type DefaultTrussParamsType = {
	simple: boolean,
	density: number,
	area: number,
	youngsModulus: number,
	shearModulus: number,
	poissonsRatio?: number,
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
	connection: Connection,
	a: Joint,
	b: Joint,
}

export type MaterialJSONType = {
	id: string,
	name: string,
	color: string,
	density: number,
	youngsModulus: number,
	shearModulus: number,
	poissonsRatio: number,
	ultimateStress: {
		tension: number,
		compression: number
	},
}

export type JointJSONType = {
	id: string,
	position: [number, number]
	fixtures?: { x: boolean, y: boolean }
	displacement?: [number, number]
	force?: [number, number]
	connections: { [id: string]: string }
}

export type ConnectionJSONType = {
	id: string,
	jointIds?: [string, string],
	stress: number,
	area: number,
	length: number,
	angle: number,
	material: MaterialJSONType,
}

export type TrussJSONType = {
	joints: JointJSONType[],
	connections: ConnectionJSONType[]
}

export type ProfileType<T> = {
	id: string,
	name: string,
	image?: string,
	params: T,
	configure: (...params: T) => ConfiguredProfileType,
}

export type ConfiguredProfileType = {
	areaMomentOfInertia: (area: number) => number,
}