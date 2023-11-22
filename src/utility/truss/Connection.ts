import { ConnectionJSONType } from "../../types/truss"
import { getUUID } from "../functions"

export default class Connection {
	id: string

	// positive force is compression (toward the center of the joint) and negative force is tension (toward the outside of the joint)
	private force: number

	private density: number
	private area: number

	private youngsModulus: number

	private ultimateStress: { 
		tensile: number, 
		compressive: number
	}

	constructor(force: number = 0, density: number = 1, area: number = 1, youngsModulus: number = 1, ultimateStress: { tensile: number; compressive: number; } = { tensile: -Infinity, compressive: Infinity }) {
		this.id = getUUID()
		
		this.force = force

		this.density = density
		this.area = 0

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

	getWeight(length: number): number {
		return this.density * this.area * length
	}

	toJSON(): ConnectionJSONType {
		return {
			force: this.force,
			density: this.density,
			area: this.area,
			youngsModulus: this.youngsModulus,
			ultimateStress: this.ultimateStress,
		}
	}

	static fromJSON(json: ConnectionJSONType): Connection {
		return new Connection(json.force, json.density, json.area, json.youngsModulus, json.ultimateStress)
	}
}