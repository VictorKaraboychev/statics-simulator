import { Vector2 } from 'three'
import { JointJSONType } from '../../types/truss'
import { getUUID } from '../functions'

export default class Joint {
	id: string

	position: Vector2
	fixtures: { x: boolean, y: boolean }

	force: Vector2
	displacement: Vector2 = new Vector2(0, 0)

	connections: { [id: string]: string } = {}

	constructor(position: Vector2, fixtures = { x: false, y: false }, force = new Vector2(0, 0)) {
		this.id = getUUID()

		this.position = position
		this.fixtures = fixtures
		this.force = force
	}

	get numConnections(): number {
		return Object.keys(this.connections).length
	}

	get fixed(): boolean {
		return this.fixtures.x || this.fixtures.y
	}

	angleTo(joint: Joint): number {
		return this.position.clone().sub(joint.position).angle()
	}

	distanceTo(joint: Joint): number {
		return this.position.distanceTo(joint.position)
	}

	clone(): Joint {
		const copy = new Joint(this.position.clone(), this.fixtures, this.force.clone())
		copy.id = this.id
		copy.displacement = this.displacement.clone()
		copy.connections = { ...this.connections }
		return copy
	}

	toJSON(): JointJSONType {
		return {
			id: this.id,
			position: this.position.toArray(),
			fixtures: this.fixed ? this.fixtures : undefined,
			displacement: !this.displacement.equals(new Vector2(0, 0)) ? this.displacement.toArray() : undefined,
			force: !this.force.equals(new Vector2(0, 0)) ? this.force.toArray() : undefined,
			connections: this.connections,
		}
	}

	static fromJSON(json: JointJSONType): Joint {
		const joint = new Joint(
			new Vector2(json.position[0], json.position[1]),
			json.fixtures,
			json.force ? new Vector2(json.force[0], json.force[1]) : undefined
		)
		joint.id = json.id
		if (json.displacement) joint.displacement = new Vector2(json.displacement[0], json.displacement[1])
		joint.connections = json.connections
		return joint
	}
}