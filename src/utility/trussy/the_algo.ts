import { Vector2 } from 'three'

import GeneticAlgorithm from "../GeneticAlgorithm"
import Truss from "../Truss"
import { randInt } from "../functions"
import { cost } from './cost'
import { meetsConstraints } from './constraints'
import { efficiency } from './efficiency'

export const test_algo = (bridge: Truss): Truss => {
    const geneticAlgorithm = new GeneticAlgorithm({
		mutate: (item: Truss) => {
			const mutationCount = randInt(0, item.size - 1)

			for (let i = 0; i < mutationCount; i++) {
				const mutation = randInt(0, item.size - 1)
				const joint = item.joints[mutation]

				if (!joint.fixed) {
					joint.position.add(new Vector2(Math.random() - 0.5, Math.random() - 0.5))
				}
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
			return (Math.random() > 0.5 ? item1 : item2).clone()
		},
		fitness: (item: Truss) => {
			// const success = meetsConstraints(item)
			
			let fitness = 0

			// for(let i = 0; i < 4; i++) {
			// 	if (!success[i]) fitness -= 1000
			// }

			// if (item.computeForces()) fitness -= 100000

			fitness -= cost(item)
			// fitness -= efficiency(item)
		
			return fitness
		},
		initialPopulation: [bridge.clone()]
	})

	for (let i = 0; i < 1; i++) {
		console.log("Generation: ", geneticAlgorithm.generation, "Best: ", geneticAlgorithm.best.item, "Worst: ", geneticAlgorithm.worst.item, "Avg Fitness: ", geneticAlgorithm.avgFitness)
		geneticAlgorithm.evolve()
	}

	return geneticAlgorithm.best.item
}