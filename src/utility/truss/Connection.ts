import { ConnectionJSONType } from "../../types/truss"
import { getUUID } from "../functions"

export default class Connection {
	id: string

	// [jointId1, jointId2] or null if not connected
	jointIds: [string, string] | null = null

	// positive force is compression (toward the center of the joint) and negative force is tension (toward the outside of the joint)
	stress: number

	density: number
	area: number

	youngsModulus: number

	ultimateStress: {
		tension: number,
		compression: number
	}

	constructor(stress: number = 0, density: number = 1, area: number = 1, youngsModulus: number = 1, ultimateStress: { tension: number; compression: number; } = { tension: -Infinity, compression: Infinity }) {
		this.id = getUUID()

		this.stress = stress

		this.density = density
		this.area = area

		this.youngsModulus = youngsModulus
		this.ultimateStress = ultimateStress
	}

	set force(force: number) {
		this.stress = force / this.area
	}

	get force(): number {
		return this.stress * this.area
	}

	get strain(): number {
		return this.stress / this.youngsModulus
	}

	get utilization(): number {
		return Math.abs(this.stress) / Math.abs(this.ultimateStress[this.stressType])
	}

	get failure(): boolean {
		return this.utilization > 1
	}

	get stressType(): 'tension' | 'compression' {
		return this.stress > 0 ? 'compression' : 'tension'
	}

	getElongation(length: number): number {
		return this.strain * length
	}

	getVolume(length: number): number {
		return this.area * length
	}

	getMass(length: number): number {
		return this.density * this.area * length
	}

	clone(): Connection {
		const connection = new Connection(this.force, this.density, this.area, this.youngsModulus, this.ultimateStress)
		connection.id = this.id
		connection.jointIds = this.jointIds
		return connection
	}

	toJSON(): ConnectionJSONType {
		return {
			id: this.id,
			jointIds: this.jointIds ?? undefined,
			stress: this.stress,
			density: this.density,
			area: this.area,
			youngsModulus: this.youngsModulus,
			ultimateStress: this.ultimateStress,
		}
	}

	static fromJSON(json: ConnectionJSONType): Connection {
		const connection = new Connection(json.stress, json.density, json.area, json.youngsModulus, json.ultimateStress)
		connection.id = json.id
		connection.jointIds = json.jointIds ?? null
		return connection
	}
}