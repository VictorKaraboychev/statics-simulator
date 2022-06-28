import Truss from "../Truss";

const constraints = {
    maxCompression: 4,
    maxTension: 8,
    minLength: 1,
    maxLength: 15,
}

/*
    @returns {boolean}
    constraints = {
        maxCompression: 4,
        maxTension: 8,
        minLength: 1,
        maxLength: 15,
    }
*/
export const meetsConstraints = (truss: Truss): boolean[] => {
		const joints = truss.joints
        // cases: [maxCompression, maxTension, minLength, maxLength]
        const cases: boolean[] = [true, true, true, true]
		for (let i = 0; i < joints.length; i++) {
			const joint = joints[i]
			const connections = truss.getConnections(joint.id)
			
			for (let j = 0; j < connections.length; j++) {
				const connection = connections[j]
				const distance = joint.position.distanceTo(connection.position)
				if (constraints.minLength && distance < constraints.minLength) cases[0] = false
				if (constraints.maxLength && distance > constraints.maxLength) cases[1] = false
				if (constraints.maxCompression && joint.connections[connection.id]! > constraints.maxCompression) cases[2] = false
				if (constraints.maxTension && joint.connections[connection.id]! < -constraints.maxTension) cases[3] = false
			}
		}
		return cases
	}
