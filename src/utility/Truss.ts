<<<<<<< Updated upstream
import Matrix, { solve, inverse, linearDependencies } from "ml-matrix"
import { Vector2, Vector3 } from "three"
=======
import Matrix, { solve } from "ml-matrix"
import { Vector2 } from "three"
import { TrussJSONType, TrussStressConstraints } from "../types/truss"
>>>>>>> Stashed changes
import Joint from "./Joint"

export default class Truss {
	private truss: Joint[] = []
	private size_: number

	private connections_: Set<[number, number, number]> = new Set()

<<<<<<< Updated upstream
	private connections_: [number, number, number | 1][] = []

	constructor(joints: Joint[], connections: [number, number, number | 1][], maxCompression?: number, maxTension?: number) {
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
=======
	constructor(joints: Joint[], connections: [number, number, number][]) {
		for (let i = 0; i < joints.length; i++) {
			const joint = joints[i]
			for (let j = 0; j < connections.length; j++) {
				const [a, b, c] = connections[j]
				joint.connections[a === i ? b : a] = { force: null, multiplier: c }
			}
			this.truss[i] = joint
		}
		this.connections_ = new Set(connections)
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
	get connections(): [number, number, number | 1][] {
		// const connections: [number, number][] = []
		// const joints = this.joints

		// for (let i = 0; i < this.size_; i++) {
		// 	const a = joints[i]
		// 	for (let j = i; j < this.size_; j++) {
		// 		const b = joints[j]
		// 		if (b.id in a.connections) {
		// 			connections.push([i, j])
		// 		}
		// 	}
		// }
		return this.connections_
=======
	get connections(): [number, number, number][] {
		const connections: [number, number, number][] = []
		const joints = this.joints

		for (let i = 0; i < this.size_; i++) {
			const a = joints[i]
			for (let j = i; j < this.size_; j++) {
				const b = joints[j]
				console.log(a.id, b.id)
				if (b.id in a.connections) {
					connections.push([i, j, a.connections[b.id].multiplier || 1])
				}
			}
		}
		return connections
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
	removeJoint(id: string): Truss {
		// const joint = this.truss[id]
=======
	removeJoint(id: number): Truss {
>>>>>>> Stashed changes
		this.getConnections(id).forEach((connection) => {
			delete connection.connections[id]
		})
		delete this.truss[id]

		this.size_--
		return this
	}

<<<<<<< Updated upstream
	getJoint(id: string): Joint {
=======
	addConnection(fromId: number, toId: number, multiplier: number = 1): Truss {
		this.truss[fromId].connections[toId] = { force: null, multiplier }
		this.truss[toId].connections[fromId] = { force: null, multiplier }
		return this
	}

	removeConnection(fromId: number, toId: number): Truss {
		delete this.truss[fromId].connections[toId]
		delete this.truss[toId].connections[fromId]
		return this
	}

	getJoint(id: number): Joint {
>>>>>>> Stashed changes
		return this.truss[id]
	}

	getConnections(id: number): Joint[] {
		return Object.keys(this.truss[id].connections).map((key) => this.truss[Number(key)])
	}

	getForce(fromId: number, toId: number): number | null {
		return this.truss[fromId].connections[toId].force
	}

	getStress(fromId: number, toId: number, constraints: TrussStressConstraints): number {
		const connection = this.truss[fromId].connections[toId]
		const force = (connection.force || 0) / (connection.multiplier || 1)

		if (force > 0) return force / constraints.maxCompression
		if (force < 0) return force / constraints.maxTension
		return 0
	}

	compute(): boolean {
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

			for (let i = 0; i < connections.length; i++) {
				const [a, b] = connections[i]
				const aJ = joints[a]
				const bJ = joints[b]
	
				const value = S.get(i, 0)
	
				aJ.connections[bJ.id].force = value
				bJ.connections[aJ.id].force = value
			}

			for (let i = 0; i < joints.length; i++) {
				const joint = joints[i]
				if (joint.fixtures.length > 0) {
					joint.externalForce.set(F.get(i * 2, 0), F.get(i * 2 + 1, 0))
				}
			}
	
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
<<<<<<< Updated upstream
		return new Truss(this.joints.map((joint) => joint.clone()), this.connections, this.maxCompression, this.maxTension)
=======
		return new Truss(this.joints.map((joint) => joint.clone()), [ ...this.connections ])
>>>>>>> Stashed changes
	}

	toJSON(): any {
		return {
			joints: this.joints.map((joint) => joint.toJSON()),
			connections: this.connections,
		}
	}

	toString(): string {
		return JSON.stringify(this.truss)
	}

<<<<<<< Updated upstream
	static fromJSON(json: any): Truss {
		return new Truss(json.joints.map((joint: any) => Joint.fromJSON(joint)), json.connections, json.maxCompression, json.maxTension)
=======
	static fromJSON(json: TrussJSONType): Truss {
		return new Truss(
			json.joints.map((joint) => Joint.fromJSON(joint)),
			json.connections,
		)
>>>>>>> Stashed changes
	}
}