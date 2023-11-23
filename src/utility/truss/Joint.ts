import { Vector2 } from 'three'
import { JointJSONType } from '../../types/truss'
import { getUUID } from '../functions'

export const FIXTURE = {
	Pin: { x: true, y: true },
	RollerX: { x: true, y: false },
	RollerY: { x: false, y: true },
	Free: { x: false, y: false },
}

export default class Joint {
	id: string

	position: Vector2
	fixtures: { x: boolean, y: boolean }
	externalForce: Vector2
	connections: { [id: string]: string } = {}

	constructor(position: Vector2, fixtures = { x: false, y: false }, external_force: Vector2 = new Vector2(0, 0)) {
		this.id = getUUID()
		this.position = position
		this.fixtures = fixtures
		this.externalForce = external_force
	}

	get numConnections(): number {
		return Object.keys(this.connections).length
	}

	get fixed(): boolean {
		return this.fixtures.x || this.fixtures.y
	}

	angleTo(joint: Joint): number {
		return Math.atan2(this.position.y - joint.position.y, this.position.x - joint.position.x)
	}

	distanceTo(joint: Joint): number {
		return Math.sqrt((this.position.x - joint.position.x) ** 2 + (this.position.y - joint.position.y) ** 2)
	}

	clone(): Joint {
		const copy = new Joint(this.position.clone(), this.fixtures, this.externalForce.clone())
		copy.id = this.id
		copy.connections = { ...this.connections }
		return copy
	}

	toJSON(): JointJSONType {
		return {
			id: this.id,
			position: this.position.toArray(),
			fixtures: this.fixed ? this.fixtures : undefined,
			externalForce: !this.externalForce.equals(new Vector2(0, 0)) ? this.externalForce.toArray() : undefined,
			connections: this.connections,
		}
	}

	static fromJSON(json: JointJSONType): Joint {
		const joint = new Joint(
			new Vector2(json.position[0], json.position[1]),
			json.fixtures,
			json.externalForce ? new Vector2(json.externalForce[0], json.externalForce[1]) : undefined
		)
		joint.id = json.id
		joint.connections = json.connections
		return joint
	}
}