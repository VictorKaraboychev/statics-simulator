import Truss from '../Truss'

const constraints = {
	maxCompression: 8000,
	maxTension: 12000,
	minLength: 1,
	maxLength: 15,
}

/**
 *  @returns {boolean}
 *  constraints = {
 * 		maxCompression: 4,
 *		maxTension: 8,
 *		minLength: 1,
 *		maxLength: 15,
 *	}
 */
export const meetsConstraints = (truss: Truss): number[] => {
	// cases: [maxCompression, maxTension, minLength, maxLength]
	const cases: number[] = [0, 0, 0, 0]

	const joints = truss.joints
	const connections = truss.connections
	
	for (let i = 0; i < connections.length; i++) {
		const [a, b] = connections[i]

		const p1 = joints[a]
		const p2 = joints[b]

		// console.log(p1.connections[p2.id].force)

		const distance = p1.distance(p2)
		if (constraints.minLength && distance < constraints.minLength) cases[0] += 1
		if (constraints.maxLength && distance > constraints.maxLength) cases[1] += 1
		if (constraints.maxCompression && p1.connections[p2.id].force! > constraints.maxCompression * p1.connections[p2.id].multiplier) cases[2] += 1
		if (constraints.maxTension && p1.connections[p2.id].force! < -constraints.maxTension * p1.connections[p2.id].multiplier ) cases[3] += 1
	}

	return cases
}
