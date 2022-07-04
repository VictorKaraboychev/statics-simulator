import Truss from '../Truss'

const constraints = {
	maxCompression: 4,
	maxTension: 8,
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
export const meetsConstraints = (truss: Truss): boolean[] => {
	// cases: [maxCompression, maxTension, minLength, maxLength]
	const cases: boolean[] = [true, true, true, true]

	const joints = truss.joints
	const connections = truss.connections
	
	for (let i = 0; i < connections.length; i++) {
		const [a, b] = connections[i]

		const p1 = joints[a]
		const p2 = joints[b]

		const distance = p1.distance(p2)
		if (constraints.minLength && distance < constraints.minLength) cases[0] = false
		if (constraints.maxLength && distance > constraints.maxLength) cases[1] = false
		if (constraints.maxCompression && p1.connections[p2.id].force! > constraints.maxCompression) cases[2] = false
		if (constraints.maxTension && p1.connections[p2.id].force! < -constraints.maxTension) cases[3] = false
	}

	return cases
}
