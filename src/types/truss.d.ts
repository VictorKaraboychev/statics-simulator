import { Vector2 } from "three"
import Joint from "../utility/Joint"
import { JointJSONType } from "./joint"

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
	multiplier: number,
	a: Joint,
	b: Joint,
}

export type TrussJSONType = {
	joints: JointJSONType[],
	connections: [number, number, number][]
}

export type TrussConstraintsType = {
	maxCompression: number,
	maxTension: number,
}