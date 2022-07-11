import { Vector2 } from 'three'
import GeneticAlgorithm from "../GeneticAlgorithm"
import Truss from "../Truss"
import { randInt } from "../functions"
import { meetsConstraints } from './constraints'
import { efficiency } from './efficiency'
import { TrussConstraintsType } from '../../types/truss'

export const getGeneticAlgorithm = (bridge: Truss, constraints: TrussConstraintsType) => {
    return new GeneticAlgorithm({
		mutate: (item: Truss, i) => {
			const mutationCount = randInt(0, item.size - 1)

			for (let i = 0; i < mutationCount; i++) {
				const mutation = randInt(0, item.size - 1)
				const joint = item.joints[mutation]

				if (!joint.fixed) {
					joint.position.add(new Vector2((Math.random() - 0.5) / 2, (Math.random() - 0.5) / 2))
					// joint.position.add(new Vector2(Math.random() / (Math.sqrt(i) + 1) - 0.5 / (Math.sqrt(i) + 1), Math.random() / (Math.sqrt(i) + 1) - 0.5 / (Math.sqrt(i) + 1)))
				}
			}

			const joints = item.joints
			const connections = item.connections
			const mutationMultiplier = randInt(0, connections.length - 1)

			for (let i = 0; i < mutationMultiplier; i++) {
				const mutation = randInt(0, connections.length - 1)
				
				const value = randInt(1, 4)

				const [a, b] = connections[mutation]
				joints[a].connections[joints[b].id].multiplier = value
				joints[b].connections[joints[a].id].multiplier = value
			}

			// if (Math.random() < 0.02) {
			// 	if (Math.random() < 0.5) {
			// 		const indexA = randInt(0, item.size - 1)
			// 		const indexB = randInt(0, item.size - 1)

			// 		const position = item.joints[indexA].position.clone().add(item.joints[indexB].position).divideScalar(2).add(new Vector2(Math.random() * 4 - 2, Math.random() * 4 - 2))

			// 		item.addJoint(new Joint(position), [indexA, indexB])
			// 	} else {
			// 		const a = item.joints[randInt(0, item.size - 1)]
			// 		if (!a.fixed) item.removeJoint(a.id)
			// 	}
			// }

			return item
		},
		crossover: (item1: Truss, item2: Truss) => {
			// const newTruss = item1.clone()

			// const joints2 = item2.joints

			// newTruss.joints.forEach((joint, i) => {
			// 	joint.position.add(joints2[i].position).divideScalar(2)
			// })

			// return newTruss
			return Math.random() < 0.5 ? item1 : item2
		},
		fitness: (item: Truss) => {
			let fitness = item.compute() ? 0 : -100000

			// const [maxCompression, maxTension, minLength, maxLength] = meetsConstraints(item)
			
			// if (minLength) fitness -= 100000
			

			// for(let i = 0; i < 4; i++) {
			// 	if (!success[i]) fitness -= 1000
			// }
			
			fitness -= item.getCost(5, 15) 
			fitness -= efficiency(item, constraints) * 100
		
			return fitness
		},
		initialPopulation: [bridge.clone()]
	})
}