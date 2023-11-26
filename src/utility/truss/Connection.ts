import { ConnectionJSONType } from "../../types/truss"
import { getUUID } from "../functions"
import Material from "./Material"

export enum FailureMode {
	NONE,
	AXIAL,
	BUCKLING,
}

export default class Connection {
	id: string

	jointIds: [string, string] | null = null // [jointId1, jointId2] or null if not connected

	axialStress: number // positive force is tension (toward the outside of the connection) and negative force is compression (toward the center of the connection)
	
	length: number
	angle: number
	area: number

	material: Material

	constructor(stress = 0, length = 0, angle = 0, area = 1, material?: Material) {
		this.id = getUUID()

		this.axialStress = stress

		this.length = length
		this.angle = angle
		this.area = area

		this.material = material ?? new Material('Material')
	}

	set force(force: number) {
		this.axialStress = force / this.area
	}

	get force(): number {
		return this.axialStress * this.area
	}

	get transverseStress(): number {
		return this.transverseStrain * this.material.youngsModulus
	}

	get axialStrain(): number {
		return this.axialStress / this.material.youngsModulus
	}

	get transverseStrain(): number {
		return -this.axialStrain * this.material.poissonsRatio
	}

	get axialElongation(): number {
		return this.axialStrain * this.length
	}

	get transverseElongation(): number {
		return this.transverseStrain * this.length
	}

	get utilization(): number {
		return Math.abs(this.axialStress) / Math.abs(this.material.ultimateStress[this.stressType])
	}

	get safetyFactor(): number {
		return 1 / this.utilization
	}

	get failure(): FailureMode {
		if (this.utilization <= 1) return FailureMode.NONE
		return FailureMode.AXIAL
	}

	get stressType(): 'tension' | 'compression' {
		return this.axialStress < 0 ? 'compression' : 'tension'
	}

	get axialStiffness(): number {
		return this.material.youngsModulus * this.area / this.length
	}

	get areaMomentOfInertia(): number {
		return this.area ** 2 / 6
	}

	get bucklingForce(): number {
		return Math.PI ** 2 * this.material.youngsModulus * this.areaMomentOfInertia / this.length ** 2
	
	}

	get volume(): number {
		return this.area * this.length
	}

	get mass(): number {
		return this.material.density * this.volume
	}

	clone(): Connection {
		const connection = new Connection(this.force, this.length, this.angle, this.area, this.material.clone())
		connection.id = this.id
		connection.jointIds = this.jointIds
		return connection
	}

	toJSON(): ConnectionJSONType {
		return {
			id: this.id,
			jointIds: this.jointIds ?? undefined,
			stress: this.axialStress,
			length: this.length,
			angle: this.angle,
			area: this.area,
			material: this.material.toJSON(),
		}
	}

	static fromJSON(json: ConnectionJSONType): Connection {
		const connection = new Connection(json.stress, json.length, json.angle, json.area, Material.fromJSON(json.material))
		connection.id = json.id
		connection.jointIds = json.jointIds ?? null
		return connection
	}
}