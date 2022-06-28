import Matrix, { solve } from "ml-matrix"
import { Vector2, Vector3 } from "three"
import Joint from "./Joint"

export default class Truss {
	private truss: { [key: string]: Joint } = {}
	private size_: number

	private maxCompression: number = 0
	private maxTension: number = 0

	constructor(joints: Joint[], connections: [number, number][], maxCompression?: number, maxTension?: number) {
		const cleanedJoints = joints.map((joint) => {
			joint.computed = false
			joint.connections = {}
			return joint
		})

		cleanedJoints.forEach((joint, i) => {
			connections.forEach(([a, b]) => {
				if (a === i) {
					joint.connections[cleanedJoints[b].id] = null
				} else if (b === i) {
					joint.connections[cleanedJoints[a].id] = null
				}
			})
			this.truss[joint.id] = joint
		})
		this.maxCompression = maxCompression ?? 0
		this.maxTension = maxTension ?? 0
		this.size_ = joints.length
	}

	get size(): number {
		return this.size_
	}

	get boundingBox(): { min: Vector2, max: Vector2 } {
		const joints = this.joints
		const min = new Vector2(Infinity, Infinity)
		const max = new Vector2(-Infinity, -Infinity)

		joints.forEach((joint) => {
			min.x = Math.min(min.x, joint.position.x)
			min.y = Math.min(min.y, joint.position.y)
			max.x = Math.max(max.x, joint.position.x)
			max.y = Math.max(max.y, joint.position.y)
		})

		return { min, max }
	}

	get center(): Vector2 {
		const { min, max } = this.boundingBox
		return new Vector2((min.x + max.x) / 2, (min.y + max.y) / 2)
	}

	get joints(): Joint[] {
		return Object.values(this.truss)
	}

	get connections(): [number, number][] {
		const connections: [number, number][] = []
		const joints = this.joints

		for (let i = 0; i < this.size_; i++) {
			const a = joints[i]
			for (let j = i; j < this.size_; j++) {
				const b = joints[j]
				if (b.id in a.connections) {
					connections.push([i, j])
				}
			}
		}
		return connections
	}

	addJoint(joint: Joint, connections: number[]): Truss {
		connections.forEach((connection) => {
			joint.connections[this.joints[connection].id] = null
			this.joints[connection].connections[joint.id] = null
		})
		this.truss[joint.id] = joint

		this.size_++
		return this
	}

	removeJoint(id: string): Truss {
		// const joint = this.truss[id]
		this.getConnections(id).forEach((connection) => {
			delete connection.connections[id]
		})
		delete this.truss[id]

		this.size_--
		return this
	}

	getJoint(id: string): Joint {
		return this.truss[id]
	}

	getConnections(id: string): Joint[] {
		return Object.keys(this.truss[id].connections).map((key) => this.truss[key])
	}

	getForce(fromId: string, toId: string): number | null {
		return this.truss[fromId].connections[toId]
	}

	getStress(fromId: string, toId: string): number {
		const force = this.truss[fromId].connections[toId]

		if (force === null) return 0
		if (force > 0) return force / this.maxCompression
		if (force < 0) return force / this.maxTension
		return 0
	}

	meetsConstraints(constrains: {
		maxCompression?: number,
		maxTension?: number,
		minLength?: number,
		maxLength?: number,
	}): boolean {
		const joints = this.joints
		for (let i = 0; i < joints.length; i++) {
			const joint = joints[i]
			const connections = this.getConnections(joint.id)
			
			for (let j = 0; j < connections.length; j++) {
				const connection = connections[j]
				const distance = joint.position.distanceTo(connection.position)
				if (constrains.minLength && distance < constrains.minLength) return false
				if (constrains.maxLength && distance > constrains.maxLength) return false
				if (constrains.maxCompression && joint.connections[connection.id]! > constrains.maxCompression) return false
				if (constrains.maxTension && joint.connections[connection.id]! < -constrains.maxTension) return false
			}
		}
		return true
	}

	computeFixtureForces(): boolean {
		let f = 0
		const fixtures = new Matrix(3, 3)
		const netForce = Matrix.columnVector(this.joints.reduce((acc, joint) => {
			if (joint.fixtures.length > 0) {
				for (let i = 0; i < joint.fixtures.length; i++) {
					const fixture = joint.fixtures[i]
					fixtures.setColumn(f, [
						fixture.x,
						fixture.y,
						fixture.clone().cross(joint.position)
					])
					f++
				}
			}

			return acc.add(new Vector3(
				joint.external_force.x,
				joint.external_force.y,
				joint.external_force.clone().cross(joint.position) // moment
			))
		}, new Vector3(0, 0, 0)).toArray())

		if (f !== 3) return false

		const isDefined = fixtures.reducedEchelonForm().diagonal().every((v) => v !== 0)
		if (!isDefined) return false

		const solution = solve(fixtures, netForce)
		f = 0
		this.joints.forEach((joint, i) => {
			if (joint.fixtures.length > 0) {
				joint.fixtures.forEach((fixture, j) => {
					joint.external_force.sub(fixture.clone().setLength(solution.get(f, 0)))
					f++
				})
			}
		})

		return true
	}

	computeForces(): boolean {
		this.joints.forEach((joint) => joint.computed = false)

		// evaluate the forces on each fixture
		if (this.computeFixtureForces() === false) return false

		// evaluate the forces on each joint (method of joints)

		const queue: Joint[] = this.joints.filter((joint) => {
			return joint.degrees_of_freedom <= 1
		})

		if (queue.length === 0) return false
		let i = 0

		while (queue.length > 0 && i < 2 * this.size_) {
			const joint = queue.shift()!
			// console.log(i, joint.id, joint.connections_count, joint.degrees_of_freedom)

			if (joint.degrees_of_freedom <= 1) {
				if (!joint.computed) {
					const connections = this.getConnections(joint.id)
	
					let f = 0
					const connectionForces = new Matrix(2, 0)
					// net force is the sum of the external force and the forces exerted by the connections
					const netForce = Matrix.columnVector(connections.reduce((acc, connection) => {
						const angle = connection.angleTo(joint)
		
						// unknown force
						if (connection.connections[joint.id] === null) {
	
							connectionForces.addColumn(f, [
								Math.cos(angle),
								Math.sin(angle)
							])
							f++
							return acc
						}
						
						// known force
						const force = connection.connections[joint.id] as number
						return acc.sub(new Vector2(Math.cos(angle) * force, Math.sin(angle) * force))
					}, joint.external_force.clone()).toArray())
			
					if (f === 0) break
					if (f < 3) {
						const solution = solve(connectionForces, netForce)
	
						f = 0
						connections.forEach((connection) => {
							if (joint.connections[connection.id] === null) {
								const force = solution.get(f, 0)
								joint.connections[connection.id] = force
								this.getJoint(connection.id).connections[joint.id] = force
								f++
								queue.push(connection)
							}
						})
						joint.computed = true
						i--
					} else {
						// console.log(joint.id, connectionForces, netForce, queue.length)
						queue.push(joint)
						i++
					}
				}
			} else {
				queue.push(joint)
				i++
			}
		}
		return i < 2 * this.size_
	}

	clone(): Truss {
		return new Truss(this.joints.map((joint) => joint.clone()), this.connections, this.maxCompression, this.maxTension)
	}

	toString(): string {
		return JSON.stringify(this.truss)
	}
}