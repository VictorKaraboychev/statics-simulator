import { MaterialJSONType } from "../../types/truss"
import { getUUID } from "../functions"

export default class Material {
	id: string

	name: string
	color: string

	density: number

	youngsModulus: number
	shearModulus: number
	poissonsRatio: number

	ultimateStress: {
		tension: number,
		compression: number
	}

	constructor(name: string, color = "#000000", density = 0, youngsModulus = 1, shearModulus = 1, poissonsRatio = 1, ultimateStress = { tension: -Infinity, compression: Infinity }) {
		this.id = getUUID()

		this.name = name
		this.color = color

		this.density = density

		this.youngsModulus = youngsModulus
		this.shearModulus = shearModulus
		this.poissonsRatio = poissonsRatio

		this.ultimateStress = ultimateStress
	}

	clone(): Material {
		const material = new Material(
			this.name,
			this.color,
			this.density,
			this.youngsModulus,
			this.shearModulus,
			this.poissonsRatio,
			this.ultimateStress,
		)
		material.id = this.id
		return material
	}

	toJSON(): MaterialJSONType {
		return {
			id: this.id,
			name: this.name,
			color: this.color,
			density: this.density,
			youngsModulus: this.youngsModulus,
			shearModulus: this.shearModulus,
			poissonsRatio: this.poissonsRatio,
			ultimateStress: this.ultimateStress,
		}
	}

	static fromJSON(json: MaterialJSONType): Material {
		const material = new Material(
			json.name,
			json.color,
			json.density,
			json.youngsModulus,
			json.shearModulus,
			json.poissonsRatio,
			json.ultimateStress,
		)
		material.id = json.id
		return material
	}
}