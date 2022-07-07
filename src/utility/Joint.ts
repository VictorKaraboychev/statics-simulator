import { Vector2 } from 'three'
import { JointJSONType } from '../types/joint'
export const FIXTURE = {
	Pin: [new Vector2(0, 1), new Vector2(1, 0)],
	Roller: [new Vector2(0, 1)]
}

export default class Joint {
	id: number
	position: Vector2
	fixtures: Vector2[]
	externalForce: Vector2
	connections: {
		[id: number]: {
			force: null | number,
			multiplier: null | number,
		}
	} // positive force is compression (toward the center of the joint) and negative force is tension (toward the outside of the joint)

	constructor(id: number, position: Vector2, fixtures?: Vector2[], external_force?: Vector2) {
		this.id = id
		this.position = position
		this.fixtures = (fixtures ?? []).map((f) => new Vector2(Math.abs(f.x), Math.abs(f.y)))
		this.externalForce = external_force ?? new Vector2(0, 0)
		this.connections = {}
	}

	get connections_count(): number {
		return Object.keys(this.connections).length
	}

	get fixed(): boolean {
		return this.externalForce.x !== 0 || this.externalForce.y !== 0
	}

	angleTo(joint: Joint): number {
		return Math.atan2(this.position.y - joint.position.y, this.position.x - joint.position.x)
	}

	distance(joint: Joint): number {
		return Math.sqrt((this.position.x - joint.position.x) ** 2 + (this.position.y - joint.position.y) ** 2)
	}

	toJSON(): JointJSONType {
		return {
			id: this.id,
			position: this.position.toArray(),
			fixtures: this.fixtures.length > 0 ? this.fixtures.map((f) => f.toArray()) : undefined,
			externalForce: !this.externalForce.equals(new Vector2(0, 0)) ? this.externalForce.toArray() : undefined,
		}
	}

	clone(): Joint {
		const copy = new Joint(
			this.id,
			this.position.clone(),
			this.fixtures.map((f) => f.clone()),
			this.externalForce.clone()
		)
		copy.connections = { ...this.connections }
		return copy
	}

	static fromJSON(json: JointJSONType): Joint {
		return new Joint(
			json.id,
			new Vector2(json.position[0], json.position[1]),
			json.fixtures?.map((f: number[]) => new Vector2(f[0], f[1])),
			json.externalForce ? new Vector2(json.externalForce[0], json.externalForce[1]) : undefined
		)
	}
}