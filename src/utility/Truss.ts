import Matrix, { solve, inverse, linearDependencies } from "ml-matrix"
import { Vector2, Vector3 } from "three"
import Joint from "./Joint"

export default class Truss {
	private truss: { [key: string]: Joint } = {}
	private size_: number

	private maxCompression: number = 0
	private maxTension: number = 0

	constructor(joints: Joint[], connections: [number, number][], maxCompression?: number, maxTension?: number) {
		joints.forEach((joint, i) => {
			connections.forEach(([a, b]) => {
				if (a === i) {
					joint.connections[joints[b].id] = null
				} else if (b === i) {
					joint.connections[joints[a].id] = null
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

	// computeForces(): boolean {
	// 	this.joints.forEach((joint) => joint.computed = false)

	// 	// evaluate the forces on each fixture
	// 	if (this.computeFixtureForces() === false) return false

	// 	// evaluate the forces on each joint (method of joints)

	// 	const queue: Joint[] = this.joints.filter((joint) => {
	// 		return joint.degrees_of_freedom <= 1
	// 	})

	// 	if (queue.length === 0) return false
	// 	let i = 0

	// 	while (queue.length > 0 && i < 2 * this.size_) {
	// 		const joint = queue.shift()!
	// 		// console.log(i, joint.id, joint.connections_count, joint.degrees_of_freedom)

	// 		if (joint.degrees_of_freedom <= 1) {
	// 			if (!joint.computed) {
	// 				const connections = this.getConnections(joint.id)

	// 				let f = 0
	// 				const connectionForces = new Matrix(2, 0)
	// 				// net force is the sum of the external force and the forces exerted by the connections
	// 				const netForce = Matrix.columnVector(connections.reduce((acc, connection) => {
	// 					const angle = connection.angleTo(joint)

	// 					// unknown force
	// 					if (connection.connections[joint.id] === null) {

	// 						connectionForces.addColumn(f, [
	// 							Math.cos(angle),
	// 							Math.sin(angle)
	// 						])
	// 						f++
	// 						return acc
	// 					}

	// 					// known force
	// 					const force = connection.connections[joint.id] as number
	// 					return acc.sub(new Vector2(Math.cos(angle) * force, Math.sin(angle) * force))
	// 				}, joint.external_force.clone()).toArray())

	// 				if (f === 0) break
	// 				if (f < 3) {
	// 					const solution = solve(connectionForces, netForce)

	// 					f = 0
	// 					connections.forEach((connection) => {
	// 						if (joint.connections[connection.id] === null) {
	// 							const force = solution.get(f, 0)
	// 							joint.connections[connection.id] = force
	// 							this.getJoint(connection.id).connections[joint.id] = force
	// 							f++
	// 							queue.push(connection)
	// 						}
	// 					})
	// 					joint.computed = true
	// 					i--
	// 				} else {
	// 					// console.log(joint.id, connectionForces, netForce, queue.length)
	// 					queue.push(joint)
	// 					i++
	// 				}
	// 			}
	// 		} else {
	// 			queue.push(joint)
	// 			i++
	// 		}
	// 	}
	// 	return i < 2 * this.size_
	// }

	computeForces(): boolean {
		// this.joints.forEach((joint) => joint.computed = false)

		// // // evaluate the forces on each fixture
		// if (this.computeFixtureForces() === false) return false

		const joints = this.joints
		const connections = this.connections

		const N = joints.reduce((acc, joint) => joint.fixed ? acc : acc++, 0)

		const c = this.size_
		const A = Matrix.ones(c, 1)
		const L = Matrix.columnVector(connections.map((connection) => {
			const a = joints[connection[0]]
			const b = joints[connection[1]]

			return a.distanceTo(b)
		}))
		const T = Matrix.columnVector(connections.map((connection) => {
			const a = joints[connection[0]]
			const b = joints[connection[1]]

			return a.angleTo(b)
		}))

		const K = connections.reduce((TGSM, connection) => {
			const GSM = new Matrix(this.size_ * 2, this.size_ * 2).fill(0)

			const a = joints[connection[0]]
			const b = joints[connection[1]]

			const p1 = 2 * connection[0]
			const p2 = 2 * connection[1]

			const angle = a.angleTo(b)
			const length = a.distanceTo(b)

			const C = Math.cos(angle)
			const S = Math.sin(angle)
			const CS = C * S
			const C2 = C * C
			const S2 = S * S

			const M1 = new Matrix([
				[C2, CS],
				[CS, S2]
			])

			const M2 = M1.clone().multiply(-1)

			GSM.setSubMatrix(M1, p1, p1).setSubMatrix(M2, p1, p2).setSubMatrix(M2, p2, p1).setSubMatrix(M1, p2, p2)
			GSM.divide(length)

			TGSM.add(GSM)
			return TGSM
		}, new Matrix(this.size_ * 2, this.size_ * 2).fill(0))

		let j = 0
		const DL = solve(joints.reduceRight((acc, joint, i) => {
			const jj = i * 2
			const n = joint.fixtures.length
			if (n == 2) {
				acc.removeColumn(jj)
				acc.removeColumn(jj)
				acc.removeRow(jj)
				acc.removeRow(jj)
			} else if (n === 1) {
				acc.removeColumn(jj + 1)
				acc.removeRow(jj + 1)
			}
			return acc
		}, K.clone()), joints.reduce((acc, joint, i) => {
			const n = joint.fixtures.length
			if (n == 0) {
				acc.addRow(j++, [joint.external_force.x])
				acc.addRow(j++, [joint.external_force.y])
			}
			else if (n === 1) {
				acc.addRow(j++, [joint.external_force.x])
			}
			return acc
		}, Matrix.zeros(0, 1)))

		j = 0
		const D = joints.reduce((acc, joint, i) => {
			const n = joint.fixtures.length
			if (n == 2) {
				acc.addRow(i * 2, [0])
				acc.addRow(j * 2 + 1, [0])
			} else if (n === 1) {
				acc.addRow(j * 2 + 1, [0])
			}
			j++
			return acc
		}, DL.clone())

		const F = K.mmul(D)

		const S = connections.reduce((acc, connection, i) => {
			const a = connection[0] * 2
			const b = connection[1] * 2

			const Z = new Matrix([
				[D.get(a, 0)],
				[D.get(a + 1, 0)],
				[D.get(b, 0)],
				[D.get(b + 1, 0)]
			])
			acc.addRow(i, [
				new Matrix(
					[
						[-1, 1]
					]
				)
					.mmul(
						new Matrix([
							[Math.cos(T.get(i, 0)), Math.sin(T.get(i, 0)), 0, 0],
							[0, 0, Math.cos(T.get(i, 0)), Math.sin(T.get(i, 0))]
						])
					).mmul(
						new Matrix([
							[D.get(a, 0)],
							[D.get(a + 1, 0)],
							[D.get(b, 0)],
							[D.get(b + 1, 0)]
						])
					).get(0, 0) * (1 / L.get(i, 0))]
			)

			return acc
		}, Matrix.zeros(0, 1))

		console.log(
			K.to2DArray().map((row) => row.map((value) => value.toFixed(4))),
			DL.to2DArray().map((row) => row.map((value) => value.toFixed(4))),
			D.to2DArray().map((row) => row.map((value) => value.toFixed(4))),
			F.to2DArray().map((row) => row.map((value) => value.toFixed(4))),
			S.to2DArray().map((row) => row.map((value) => value.toFixed(4))),
		)
		return true
	}

	clone(): Truss {
		return new Truss(this.joints.map((joint) => joint.clone()), this.connections, this.maxCompression, this.maxTension)
	}

	toString(): string {
		return JSON.stringify(this.truss)
	}
}