import { Vector2 } from "three"
import { round } from "./math"
import Truss from "./Truss"

/**
 * Creates a deep copy of an object.
 * @param object  Object to copy.
 * @returns  Deep copy of the object.
 */
export const deepCopy = <T>(object: T): T => {
	return JSON.parse(JSON.stringify(object)) // converts the object to JSON and back into an object
}


/**
 * Generates a v4 UUID.
 * @returns v4 UUID.
 */
export const getUUID = () => {
	return crypto.randomUUID()
}

export const equals = <T>(a: T, b: T): boolean => JSON.stringify(a) === JSON.stringify(b)

export const last = <T>(array: T[]): T => array[array.length - 1]

export const randInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min

export const roundVector2 = (vector: Vector2, decimals: number): Vector2 => {
	return new Vector2(round(vector.x, decimals), round(vector.y, decimals))
}


export const findMin = (truss: Truss): [number, Truss] => {
	const template = truss.clone()
	const tJoints = template.joints

	for (let i = 0; i < truss.size; i++) {
		const a = tJoints[i]
		for (let j = i; j < truss.size; j++) {
			const b = tJoints[j]
			if (b.id in a.connections) {
				a.connections[b.id].multiplier = 1
				b.connections[a.id].multiplier = 1
			}
		}
	}

	let min = truss.clone()
	let minCost = truss.getCost(5, 15)

	const resolution = 0.1

	const midYRange = {
		min: -10,
		max: -2.2
	}

	const sideXRange = {
		min: 2,
		max: 7
	}

	const sideYRange = {
		min: -7,
		max: -2.2
	}

	for (let i = midYRange.min; i <= midYRange.max; i += resolution) {
		for (let j = i; j <= sideYRange.max; j += resolution) {
			for (let k = sideXRange.min; k <= sideXRange.max; k += resolution) {
				const t = template.clone()
				const joints = t.joints
				joints[6].position = new Vector2(-k, j)
				joints[7].position = new Vector2(k, j)
				joints[8].position = new Vector2(0, i)

				if (t.getCost(5, 15) < minCost) {
					t.compute()

					for (let h = 0; h < joints.length; h++) {
						const a = joints[h]
						for (let o = 0; o < joints.length; o++) {
							const b = joints[o]
							if (b.id in a.connections) {
								const c = a.connections[b.id]
								if (c.force) {
									c.multiplier = Math.min(Math.ceil(Math.abs(c.force) / (c.force > 0 ? 8000 : 12000)), 4)
								}
							}
						}
					}

					const cost = t.getCost(5, 15)

					if (cost < minCost) {
						min = t
						minCost = cost
					}
				}
			}
		}
	}

	return [minCost, min]
}