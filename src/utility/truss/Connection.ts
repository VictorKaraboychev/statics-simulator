import { Vector2 } from "three"
import { ConnectionJSONType } from "../../types/truss"
import { getUUID } from "../functions"
import Material from "./Material"
import Profile, { Rectangular } from "./Profiles"

export enum FailureMode {
	NONE,
	AXIAL_TENSION,
	AXIAL_COMPRESSION,
	BUCKLING,
	SHEAR,
}

export default class Connection {
	id: string

	jointIds: [string, string] | null = null // [jointId1, jointId2] or null if not connected

	axialStress: number = 0 // + tension, - compression
	length: number = 0
	angle: number = 0

	area: number

	material: Material

	profile: Profile

	private amoi: Vector2 | null = null

	constructor(area = 1, material?: Material, profile?: Profile) {
		this.id = getUUID()
		this.area = area

		this.profile = profile ?? new Rectangular(1, 1)

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
		return this.transverseStrain * this.profile.getWidth(this.area)
	}

	get stressType(): 'tension' | 'compression' {
		return this.axialStress < 0 ? 'compression' : 'tension'
	}

	get axialStiffness(): number {
		return this.material.youngsModulus * this.area / this.length
	}

	get areaMomentOfInertia(): Vector2 {
		if (!this.amoi) this.amoi = this.profile.getAreaMomentOfInertia(this.area)
		return this.amoi
	}

	private get maximumAxialBucklingStress(): number {
		const amoi = this.areaMomentOfInertia
		return Math.PI ** 2 * this.material.youngsModulus * Math.min(amoi.x, amoi.y) / (this.length ** 2 * this.area)
	}

	get volume(): number {
		return this.area * this.length
	}

	get mass(): number {
		return this.material.density * this.volume
	}

	getSafetyFactor(simple: boolean = true): number {
		return 1 / this.getUtilization(simple)
	}

	getUtilization(simple = true): number {
		let maxStress = Math.abs(this.material.ultimateStress.tension)

		if (this.stressType === 'compression') {
			maxStress = simple ? Math.abs(this.material.ultimateStress.compression) : Math.min(Math.abs(this.maximumAxialBucklingStress), Math.abs(this.material.ultimateStress.compression))
		}

		return Math.abs(this.axialStress) / maxStress
	}

	getFailureMode(simple = true): FailureMode {
		if (this.getUtilization(simple) > 1) {
			if (this.stressType === 'tension') return FailureMode.AXIAL_TENSION
			if (!simple && Math.abs(this.maximumAxialBucklingStress) < Math.abs(this.material.ultimateStress.compression)) return FailureMode.BUCKLING
			return FailureMode.AXIAL_COMPRESSION
		}
		return FailureMode.NONE
	}

	clone(): Connection {
		const connection = new Connection(this.area, this.material.clone())
		connection.id = this.id
		connection.jointIds = this.jointIds
		return connection
	}

	toJSON(): ConnectionJSONType {
		return {
			id: this.id,
			jointIds: this.jointIds ?? undefined,
			area: this.area,
			material: this.material.toJSON(),
		}
	}

	static fromJSON(json: ConnectionJSONType): Connection {
		const connection = new Connection(json.area, Material.fromJSON(json.material))
		connection.id = json.id
		connection.jointIds = json.jointIds ?? null
		return connection
	}
}