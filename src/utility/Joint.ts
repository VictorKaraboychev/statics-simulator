import { Vector2 } from 'three'
import { getUUID } from './functions'

export const FIXTURE = {
	Pin: [new Vector2(0, 1), new Vector2(1, 0)],
	Roller: [new Vector2(0, 1)]
}

export default class Joint {
	id: string
	position: Vector2
	fixtures: Vector2[]
	externalForce: Vector2
	connections: { [id: string]: {
		force: null | number,
		distance: null | number
	} } // positive force is compression (toward the center of the joint) and negative force is tension (toward the outside of the joint)

	constructor(position: Vector2, fixtures?: Vector2[], external_force?: Vector2) {
		this.id = getUUID()
		this.position = position
		this.fixtures = (fixtures ?? []).map((f) => new Vector2(Math.abs(f.x), Math.abs(f.y)))
		this.externalForce = external_force ?? new Vector2(0, 0)
		this.connections = {}
	}

	get connections_count(): number {
		return Object.keys(this.connections).length
	}

	get degrees_of_freedom(): number {
		return Object.values(this.connections).reduce((acc: number, v) => acc + (v === null ? 1 : -1), 0) - (Math.abs(this.externalForce.x) > 0 ? 1 : 0) - (Math.abs(this.externalForce.y) > 0 ? 1 : 0) 
	}

	get fixed(): boolean {
		return this.externalForce.x !== 0 || this.externalForce.y !== 0
	}

	angleTo(joint: Joint): number {
		return Math.atan2(this.position.y - joint.position.y, this.position.x - joint.position.x)
	}

	distance(joint: Joint): number {
		// let distance = this.connections[joint.id].distance
		// if (distance === null) {
		// 	distance = Math.sqrt((this.position.x - joint.position.x) ** 2 + (this.position.y - joint.position.y) ** 2)
			
		// 	this.connections[joint.id] = {
		// 		force: null,
		// 		distance: distance
		// 	}
		// }
		return Math.sqrt((this.position.x - joint.position.x) ** 2 + (this.position.y - joint.position.y) ** 2)
	}

	toJSON(): any {
		return {
			position: this.position.toArray(),
			fixtures: this.fixtures.map((f) => f.toArray()),
			externalForce: this.fixtures.length === 0 ? this.externalForce.toArray() : [0, 0],
		}
	}

	clone(): Joint {
		const copy = new Joint(this.position.clone(), this.fixtures.map((f) => f.clone()), this.externalForce.clone())
		copy.connections = { ...this.connections }
		return copy
	}

	static fromJSON(json: any): Joint {
		const joint = new Joint(new Vector2(json.position[0], json.position[1]), json.fixtures.map((f: number[]) => new Vector2(f[0], f[1])), new Vector2(json.externalForce[0], json.externalForce[1]))
		return joint
	}
}