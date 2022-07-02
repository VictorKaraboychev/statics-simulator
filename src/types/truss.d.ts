import { Vector2 } from "three"
import Joint from "../utility/Joint"

export type TrussDetailsType = {
	cost: number,
	maxCompression: number,
	maxTension: number,
}

export type TrussJointDetailsType = {
	id: number,
	joint: Joint
}

export type TrussConnectionDetailsType = {
	id: string,
	force: number | null,
	stress: number,
	length: number,
}