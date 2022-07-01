import { Vector2 } from "three"
import { getUUID } from "./functions"

export const FIXTURE = {
	Pin: [new Vector2(0, 1), new Vector2(1, 0)],
	Roller: [new Vector2(0, 1)]
}

export default class Joint {
	id: string
	position: Vector2
	fixtures: Vector2[]
	external_force: Vector2
	connections: { [id: string]: number | null } // positive force is compression (toward the center of the joint) and negative force is tension (toward the outside of the joint)
	computed: boolean = false


	constructor(position: Vector2, fixtures?: Vector2[], external_force?: Vector2) {
		this.id = getUUID()
		this.position = position
		this.fixtures = (fixtures ?? []).map((f) => new Vector2(Math.abs(f.x), Math.abs(f.y)))
		this.external_force = external_force ?? new Vector2(0, 0)
		this.connections = {}
	}

	get connections_count(): number {
		return Object.keys(this.connections).length
	}

	get degrees_of_freedom(): number {
		return Object.values(this.connections).reduce((acc: number, v) => acc + (v === null ? 1 : -1), 0) - (Math.abs(this.external_force.x) > 0 ? 1 : 0) - (Math.abs(this.external_force.y) > 0 ? 1 : 0) 
	}

	get fixed(): boolean {
		return this.external_force.x !== 0 || this.external_force.y !== 0
	}

	angleTo(joint: Joint): number {
		return Math.atan2(this.position.y - joint.position.y, this.position.x - joint.position.x)
	}

	distanceTo(joint: Joint): number {
		return this.position.distanceTo(joint.position)
	}

	clone(): Joint {
		const copy = new Joint(this.position.clone(), this.fixtures.map((f) => f.clone()), this.external_force.clone())
		copy.connections = { ...this.connections }
		copy.computed = this.computed
		return copy
	}
}