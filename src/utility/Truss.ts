import Matrix, { solve } from "ml-matrix"
import { Vector2 } from "three"
import { TrussJSONType } from "../types/truss"
import Joint from "./Joint"

export default class Truss {
	private truss: { [key: string]: Joint } = {}
	private size_: number

	private maxCompression: number = 0
	private maxTension: number = 0

	private connections_: [number, number, number][] = []

	constructor(joints: Joint[], connections: [number, number, number][], maxCompression?: number, maxTension?: number) {
		joints.forEach((joint, i) => {
			connections.forEach(([a, b, c]) => {
				if (a === i) {
					joint.connections[joints[b].id] = { force: null, multiplier: c }
				} else if (b === i) {
					joint.connections[joints[a].id] = { force: null, multiplier: c }
				}
			})
			this.truss[joint.id] = joint
		})

		this.connections_ = connections

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

	get connections(): [number, number, number][] {
		const connections: [number, number, number][] = []
		const joints = this.joints

		for (let i = 0; i < this.size_; i++) {
			const a = joints[i]
			for (let j = i; j < this.size_; j++) {
				const b = joints[j]
				if (b.id in a.connections) {
					connections.push([i, j, a.connections[b.id].multiplier || 1])
				}
			}
		}
		return connections
	}

	get cost(): number {
		const joints = this.joints
		return this.connections.reduce((acc, [a, b, c]) => {
			acc += joints[a].distance(joints[b]) * 15 * c
			return acc
		}, this.size_ * 5)
	}

	addJoint(joint: Joint, connections: number[]): Truss {
		connections.forEach((connection) => {
			joint.connections[this.joints[connection].id].force = null
			this.joints[connection].connections[joint.id].force = null
		})
		this.truss[joint.id] = joint

		this.size_++
		return this
	}

	removeJoint(id: string): Truss {
		this.getConnections(id).forEach((connection) => {
			delete connection.connections[id]
		})
		delete this.truss[id]

		this.size_--
		return this
	}

	addConnection(fromId: string, toId: string, multiplier: number = 1): Truss {
		this.truss[fromId].connections[toId] = { force: null, multiplier }
		this.truss[toId].connections[fromId] = { force: null, multiplier }
		return this
	}

	removeConnection(fromId: string, toId: string): Truss {
		delete this.truss[fromId].connections[toId]
		delete this.truss[toId].connections[fromId]
		return this
	}

	getJoint(id: string): Joint {
		return this.truss[id]
	}

	getConnections(id: string): Joint[] {
		return Object.keys(this.truss[id].connections).map((key) => this.truss[key])
	}

	getForce(fromId: string, toId: string): number | null {
		return this.truss[fromId].connections[toId].force
	}

	getStress(fromId: string, toId: string): number {
		const connection = this.truss[fromId].connections[toId]
		const force = (connection.force || 0) / (connection.multiplier || 1)

		if (force > 0) return force / this.maxCompression
		if (force < 0) return force / this.maxTension
		return 0
	}

	// computeFixtureForces(): boolean {
	// 	let f = 0
	// 	const fixtures = new Matrix(3, 3)
	// 	const netForce = Matrix.columnVector(this.joints.reduce((acc, joint) => {
	// 		if (joint.fixtures.length > 0) {
	// 			for (let i = 0; i < joint.fixtures.length; i++) {
	// 				const fixture = joint.fixtures[i]
	// 				fixtures.setColumn(f, [
	// 					fixture.x,
	// 					fixture.y,
	// 					fixture.clone().cross(joint.position)
	// 				])
	// 				f++
	// 			}
	// 		}

	// 		return acc.add(new Vector3(
	// 			joint.externalForce.x,
	// 			joint.externalForce.y,
	// 			joint.externalForce.clone().cross(joint.position) // moment
	// 		))
	// 	}, new Vector3(0, 0, 0)).toArray())

	// 	if (f !== 3) return false

	// 	const isDefined = fixtures.reducedEchelonForm().diagonal().every((v) => v !== 0)
	// 	if (!isDefined) return false

	// 	const solution = solve(fixtures, netForce)
	// 	f = 0
	// 	this.joints.forEach((joint, i) => {
	// 		if (joint.fixtures.length > 0) {
	// 			joint.fixtures.forEach((fixture, j) => {
	// 				joint.externalForce.sub(fixture.clone().setLength(solution.get(f, 0)))
	// 				f++
	// 			})
	// 		}
	// 	})

	// 	return true
	// }

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
		// console.time('computeForces')

		const joints = this.joints
		const connections = this.connections

		const { L, T } = connections.reduce((acc, connection, i) => {
			const a = joints[connection[0]]
			const b = joints[connection[1]]

			acc.L.addRow(i, [a.distance(b)])
			acc.T.addRow(i, [a.angleTo(b)])

			return acc
		}, {
			L: new Matrix(0, 1),
			T: new Matrix(0, 1),
		})

		const K = connections.reduce((TGSM, connection, i) => {
			const GSM = Matrix.zeros(this.size_ * 2, this.size_ * 2)

			const p1 = 2 * connection[0]
			const p2 = 2 * connection[1]

			const angle = T.get(i, 0)

			const C = Math.cos(angle)
			const S = Math.sin(angle)

			const M1 = new Matrix([
				[C * C, C * S],
				[C * S, S * S]
			])

			const M2 = M1.clone().multiply(-1)

			GSM.setSubMatrix(M1, p1, p1).setSubMatrix(M2, p1, p2).setSubMatrix(M2, p2, p1).setSubMatrix(M1, p2, p2)
			GSM.divide(L.get(i, 0))

			TGSM.add(GSM)
			return TGSM
		}, Matrix.zeros(this.size_ * 2, this.size_ * 2))

		try {
			let j = 0
			const DL = solve(joints.reduceRight((acc, joint, i) => {
				const k = i * 2
				const n = joint.fixtures.length
				if (n == 2) {
					acc.removeColumn(k)
					acc.removeColumn(k)
					acc.removeRow(k)
					acc.removeRow(k)
				} else if (n === 1) {
					acc.removeColumn(k + 1)
					acc.removeRow(k + 1)
				}
				return acc
			}, K.clone()), joints.reduce((acc, joint, i) => {
				const n = joint.fixtures.length
				if (n == 0) {
					acc.addRow(j++, [joint.externalForce.x])
					acc.addRow(j++, [joint.externalForce.y])
				}
				else if (n === 1) {
					acc.addRow(j++, [joint.externalForce.x])
				}
				return acc
			}, new Matrix(0, 1)))

			const D = joints.reduce((acc, joint, i) => {
				const n = joint.fixtures.length
				if (n == 2) {
					acc.addRow(i * 2, [0])
					acc.addRow(i * 2 + 1, [0])
				} else if (n === 1) {
					acc.addRow(i * 2 + 1, [0])
				}
				return acc
			}, DL.clone())
	
			const F = K.mmul(D)
	
			const S = connections.reduce((acc, connection, i) => {
				const p1 = 2 * connection[0]
				const p2 = 2 * connection[1]
	
				acc.addRow(i, [
					new Matrix(
						[
							[-1, 1]
						]
					).mmul(
						new Matrix([
							[Math.cos(T.get(i, 0)), Math.sin(T.get(i, 0)), 0, 0],
							[0, 0, Math.cos(T.get(i, 0)), Math.sin(T.get(i, 0))]
						])
					).mmul(
						new Matrix([
							[D.get(p1, 0)],
							[D.get(p1 + 1, 0)],
							[D.get(p2, 0)],
							[D.get(p2 + 1, 0)]
						])
					).get(0, 0) / L.get(i, 0)]
				)
	
				return acc
			}, Matrix.zeros(0, 1))
	
			connections.forEach((connection, i) => {
				const a = joints[connection[0]]
				const b = joints[connection[1]]
	
				const value = S.get(i, 0)
	
				a.connections[b.id].force = value
				b.connections[a.id].force = value
			})

			joints.forEach((joint, i) => {
				if (joint.fixtures.length > 0) {
					joint.externalForce.set(F.get(i * 2, 0), F.get(i * 2 + 1, 0))
				}
			})
	
			// console.log(
			// 	K.to2DArray().map((row) => row.map((value) => value.toFixed(4))),
			// 	DL.to2DArray().map((row) => row.map((value) => value.toFixed(4))),
			// 	D.to2DArray().map((row) => row.map((value) => value.toFixed(4))),
			// 	F.to2DArray().map((row) => row.map((value) => value.toFixed(4))),
			// 	S.to2DArray().map((row) => row.map((value) => value.toFixed(4))),
			// )
	
			// console.timeEnd('computeForces')
		} catch (e) {
			return false
		}
		return true
	}

	clone(): Truss {
		return new Truss(this.joints.map((joint) => joint.clone()), [ ...this.connections ], this.maxCompression, this.maxTension)
	}

	toJSON(): TrussJSONType {
		return {
			joints: this.joints.map((joint) => joint.toJSON()),
			connections: this.connections,
			maxCompression: this.maxCompression,
			maxTension: this.maxTension
		}
	}

	toString(): string {
		return JSON.stringify(this.truss)
	}

	static fromJSON(json: TrussJSONType): Truss {
		return new Truss(
			json.joints.map((joint) => Joint.fromJSON(joint)),
			json.connections,
			json.maxCompression,
			json.maxTension
		)
	}
}