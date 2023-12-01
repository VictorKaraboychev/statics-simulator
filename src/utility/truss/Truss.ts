import Matrix, { solve } from "ml-matrix"
import { Vector2 } from "three"
import { TrussJSONType } from "../../types/truss"
import Joint from "./Joint"
import Connection from "./Connection"
import { getUUID } from "../functions"

export default class Truss {
	id: string

	private joints_: { [id: string]: Joint } = {}
	private connections_: { [id: string]: Connection } = {}

	private size_: number

	constructor(joints: Joint[] = [], connections: Connection[] = []) {
		this.id = getUUID()

		joints.forEach((joint) => {
			this.addJoint(joint)
		})

		connections.forEach((connection) => {
			this.connections_[connection.id] = connection
		})

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
		return Object.values(this.joints_)
	}

	get connections(): [number, number, Connection][] {
		const jointIdMap = Object.fromEntries(Object.values(this.joints_).map((joint, i) => [joint.id, i]))
		return Object.values(this.connections_).map((connection) => [jointIdMap[connection.jointIds![0]], jointIdMap[connection.jointIds![1]], connection])
	}

	get jointIds(): string[] {
		return Object.keys(this.joints_)
	}

	get connectionIds(): string[] {
		return Object.keys(this.connections_)
	}

	addJoint(joint: Joint): Truss {
		this.joints_[joint.id] = joint

		this.size_++

		return this
	}

	removeJoint(id: string): Truss {
		// delete connections from other joints
		Object.entries(this.joints_[id].connections).forEach(([jointId, connectionId]) => {
			delete this.joints_[jointId].connections[id]
			delete this.connections_[connectionId]
		})

		// delete joint
		delete this.joints_[id]

		this.size_--

		return this
	}

	addConnection(fromId: string, toId: string, connection: Connection): Truss {
		if (!this.joints_[fromId] || !this.joints_[toId] || this.joints_[fromId].connections[toId]) return this

		// add connection
		this.connections_[connection.id] = connection
		this.connections_[connection.id].jointIds = [fromId, toId]

		// add connection reference to joints
		this.joints_[fromId].connections[toId] = connection.id
		this.joints_[toId].connections[fromId] = connection.id

		return this
	}

	removeConnectionByIds(fromId: string, toId: string): Truss {
		if (!this.joints_[fromId]?.connections[toId]) return this

		const connectionId = this.joints_[fromId].connections[toId]

		// delete connection reference from joints
		delete this.joints_[fromId].connections[toId]
		delete this.joints_[toId].connections[fromId]

		// delete connection
		delete this.connections_[connectionId]

		return this
	}

	removeConnection(id: string): Truss {
		if (!this.connections_[id]) return this

		const [fromId, toId] = this.connections_[id].jointIds!

		// delete connection reference from joints
		delete this.joints_[fromId].connections[toId]
		delete this.joints_[toId].connections[fromId]

		// delete connection
		delete this.connections_[id]

		return this
	}

	getJoint(id: string): Joint {
		return this.joints_[id]
	}

	getConnection(id: string): Connection {
		return this.connections_[id]
	}

	getConnectionByIds(fromId: string, toId: string): Connection {
		return this.connections_[this.joints_[fromId].connections[toId]]
	}

	getConnections(id: string): Connection[] {
		return Object.values(this.joints_[id].connections).map((connectionId) => this.connections_[connectionId])
	}

	compute(): boolean {
		const joints = this.joints
		const connections = this.connections

		// console.time('computeForces')

		connections.forEach(([aIndex, bIndex, connection]) => {
			const a = joints[aIndex]
			const b = joints[bIndex]

			connection.length = a.distanceTo(b)
			connection.angle = a.angleTo(b)
		})

		const addSubMatrix = (matrix: Matrix, subMatrix: Matrix, row: number, column: number): Matrix => {
			for (let i = 0; i < subMatrix.rows; i++) {
				for (let j = 0; j < subMatrix.columns; j++) {
					matrix.set(row + i, column + j, matrix.get(row + i, column + j) + subMatrix.get(i, j))
				}
			}
			return matrix
		}

		const K = connections.reduce((TGSM, [aIndex, bIndex, connection], i) => {
			const p1 = 2 * aIndex
			const p2 = 2 * bIndex

			const angle = connection.angle

			const C = Math.cos(angle)
			const S = Math.sin(angle)

			const M1 = new Matrix([
				[C * C, C * S],
				[C * S, S * S]
			]).multiply(connection.axialStiffness)

			const M2 = Matrix.mul(M1, -1)

			addSubMatrix(TGSM, M1, p1, p1)
			addSubMatrix(TGSM, M2, p1, p2)
			addSubMatrix(TGSM, M2, p2, p1)
			addSubMatrix(TGSM, M1, p2, p2)

			return TGSM
		}, Matrix.zeros(this.size_ * 2, this.size_ * 2))

		try {
			let j = 0

			const DM = joints.reduce((acc, joint, i) => {
				const k = i * 2
				if (joint.fixtures.x) acc.addRow(k, [0])
				if (joint.fixtures.y) acc.addRow(k + 1, [0])
				return acc
			}, solve(joints.reduceRight((acc, joint, i) => {
				const k = i * 2
				if (joint.fixtures.y) {
					acc.removeColumn(k + 1)
					acc.removeRow(k + 1)
				}
				if (joint.fixtures.x) {
					acc.removeColumn(k)
					acc.removeRow(k)
				}
				return acc
			}, K.clone()), joints.reduce((acc, joint) => {
				if (!joint.fixtures.x) acc.addRow(j++, [joint.force.x])
				if (!joint.fixtures.y) acc.addRow(j++, [joint.force.y])
				return acc
			}, new Matrix(0, 1))))

			const F = K.mmul(DM).getColumnVector(0).to1DArray()
			const D = DM.getColumnVector(0).to1DArray()

			const S = connections.reduce((acc, [aIndex, bIndex, connection], i) => {
				const p1 = 2 * aIndex
				const p2 = 2 * bIndex

				const angle = connection.angle

				const C = Math.cos(angle)
				const S = Math.sin(angle)

				acc.addRow(
					i,
					[
						new Matrix(
							[
								[-1, 1]
							]
						).mmul(
							new Matrix([
								[C, S, 0, 0],
								[0, 0, C, S]
							])
						).mmul(
							new Matrix([
								[D[p1]],
								[D[p1 + 1]],
								[D[p2]],
								[D[p2 + 1]]
							])
						).get(0, 0) * (connection.material.youngsModulus / connection.length)
					]
				)

				return acc
			}, Matrix.zeros(0, 1)).getColumnVector(0).to1DArray()

			connections.forEach(([aIndex, bIndex, connection], i) => {
				connection.axialStress = -S[i] // negative because of sign convention (tension is positive)
			})

			// Update the joints
			joints.forEach((joint, i) => {
				const k = i * 2
				if (joint.fixtures.x) joint.force.x = F[k]
				if (joint.fixtures.y) joint.force.y = F[k + 1]

				joint.displacement.set(D[k], D[k + 1])
			})

			// console.log(
			// 	K.to2DArray().map((row) => row.map((value) => value.toFixed(3))),
			// 	D,
			// 	F,
			// 	S,
			// )

			// console.timeEnd('computeForces')

			console.log(this)
		} catch (e) {
			return false
		}
		return true
	}

	clone(): Truss {
		const truss = new Truss(
			this.joints.map((joint) => joint.clone()),
			Object.values(this.connections_).map((connection) => connection.clone())
		)
		truss.id = this.id
		return truss
	}

	toJSON(): TrussJSONType {
		return {
			joints: this.joints.map((joint) => joint.toJSON()),
			connections: Object.values(this.connections_).map((connection) => connection.toJSON()),
		}
	}

	static fromJSON(json: TrussJSONType): Truss {
		return new Truss(
			json.joints.map((joint) => Joint.fromJSON(joint)),
			json.connections.map((connection) => Connection.fromJSON(connection))
		)
	}
}