import { ConnectionJSONType } from "../../types/truss"
import { getUUID } from "../functions"

export default class Connection {
	id: string

	// [jointId1, jointId2] or null if not connected
	jointIds: [string, string] | null = null

	// positive force is compression (toward the center of the joint) and negative force is tension (toward the outside of the joint)
	force: number

	density: number
	area: number

	youngsModulus: number

	ultimateStress: { 
		tensile: number, 
		compressive: number
	}

	constructor(force: number = 0, density: number = 1, area: number = 1, youngsModulus: number = 1, ultimateStress: { tensile: number; compressive: number; } = { tensile: -Infinity, compressive: Infinity }) {
		this.id = getUUID()
		
		this.force = force

		this.density = density
		this.area = area

		this.youngsModulus = youngsModulus
		this.ultimateStress = ultimateStress
	}

	get stress(): number {
		return this.force / this.area
	}

	get strain(): number {
		return this.stress / this.youngsModulus
	}

	get failure(): boolean {
		return this.stress > this.ultimateStress.compressive || this.stress < this.ultimateStress.tensile
	}

	getVolume(length: number): number {
		return this.area * length
	}

	getWeight(length: number): number {
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
			force: this.force,
			density: this.density,
			area: this.area,
			youngsModulus: this.youngsModulus,
			ultimateStress: this.ultimateStress,
		}
	}

	static fromJSON(json: ConnectionJSONType): Connection {
		const connection = new Connection(json.force, json.density, json.area, json.youngsModulus, json.ultimateStress)
		connection.id = json.id
		connection.jointIds = json.jointIds ?? null
		return connection
	}
}