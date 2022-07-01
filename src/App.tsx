import React from 'react'
import { Box, ThemeProvider } from '@mui/material'
import Visualizer from './components/viewer/Visualizer'
import Truss from './utility/Truss'
import { Vector2 } from 'three'
import GeneticAlgorithm from './utility/GeneticAlgorithm'
import { randInt } from './utility/functions'
import Joint, { FIXTURE } from './utility/Joint'
import { cost }from './utility/trussy/cost'

function App() {

	const constraints = {
		minLength: 1,
		maxCompression: 4000,
		maxTension: 8000,
	}

	// const length =  1.6

	// const startingTruss = new Truss([
	// 	new Joint(new Vector2(0, 0), FIXTURE.Pin),
	// 	new Joint(new Vector2(1 * length, 0)),
	// 	new Joint(new Vector2(2 * length, 0), FIXTURE.Roller),
	// 	new Joint(new Vector2(0.5 * length, Math.sqrt(3) / 2 * length)),
		
	// 	new Joint(new Vector2(1.5 * length, Math.sqrt(3) / 2 * length), undefined, new Vector2(0, -100)),
		

	// ], [
	// 	[0, 1],
	// 	[1, 3],
	// 	[0, 3],
	// 	[4, 1],
	// 	[2, 4],
	// 	[4, 3],
	// 	[1, 2],
	// ], 4000, 8000)

	const spacing = -3;
	const multiplier = 1;
	const force = -(75000 / 4);
	const offset = -3;

	const bridge = new Truss([
		new Joint(new Vector2(0, 0), [new Vector2(1, 0), new Vector2(0, 1)]),
		new Joint(new Vector2(-spacing, 0), undefined, new Vector2(0, force)),
		new Joint(new Vector2(-spacing * 2, 0), undefined, new Vector2(0, force)),
		new Joint(new Vector2(-spacing * 3, 0), undefined, new Vector2(0, force)),
		new Joint(new Vector2(-spacing * 4, 0), undefined, new Vector2(0, force)),
		new Joint(new Vector2(15, 0), [new Vector2(0, 1)]), //5

		new Joint(new Vector2(-spacing, offset)), //6
		new Joint(new Vector2(7.5, offset)),
		new Joint(new Vector2(-spacing * 4, offset)), //8

		new Joint(new Vector2(7.5, 0.5)), //9
		

		new Joint(new Vector2(7.5, -0.5)), //10

	], [
		[0, 1],
		[1, 2],
		//[2, 3],
		[2, 9],
		[2, 10],
		[3, 9],
		[3, 10],
		[9, 10],

		[3, 4],
		[4, 5],

		[6, 7],
		[7, 8],

		[0, 6],
		[1, 6],
		[2, 6],
		[2, 7],

		[3, 7],
		[3, 8],
		[4, 8],
		[5, 8],

	], 4000 * multiplier, 8000 * multiplier)

	// const spacing = -2.5;
	// const multiplier = 10;

	// const bridge = new Truss([
	// 	new Joint(new Vector2(0, 0), FIXTURE.Pin),
	// 	new Joint(new Vector2(2.5, 0), undefined, new Vector2(0, -15000)),
	// 	new Joint(new Vector2(5, 0), undefined, new Vector2(0, -15000)),
	// 	new Joint(new Vector2(7.5, 0), undefined, new Vector2(0, -15000)),
	// 	new Joint(new Vector2(10, 0), undefined, new Vector2(0, -15000)),
	// 	new Joint(new Vector2(12.5, 0), undefined, new Vector2(0, -15000)),
	// 	new Joint(new Vector2(15, 0), FIXTURE.Roller), //6

	// 	new Joint(new Vector2(2.5, spacing)), //7
	// 	new Joint(new Vector2(5, spacing)),
	// 	new Joint(new Vector2(10, spacing)),
	// 	new Joint(new Vector2(12.5, spacing)), //10
	// ], [
	// 	[0, 1],
	// 	[1, 2],
	// 	[2, 11],
	// 	[2, 12],
	// 	[11, 12],
	// 	[3, 11],
	// 	[3, 12],
	// 	[3, 13],
	// 	[3, 14],
	// 	[13, 14],
	// 	[4, 13],
	// 	[4, 14],
	// 	[4, 5],
	// 	[5, 6],

	// 	[0, 7],
	// 	[7, 8],
	// 	[8, 9],
	// 	[9, 10],
	// 	[10, 6],

	// 	[1, 7],
	// 	[2, 8],
	// 	[4, 9],
	// 	[5, 10],

	// 	[2, 7],
	// 	[3, 8],
	// 	[3, 9],
	// 	[4, 10],


	// ], 4000 * multiplier, 8000 * multiplier)
	
	console.log('Forces Computed: ', bridge.computeForces())
	// console.log('Cost: ', cost(startingTruss))

	// const geneticAlgorithm = new GeneticAlgorithm({
	// 	mutate: (item: Truss) => {
	// 		const mutationCount = randInt(0, item.size - 1)

	// 		for (let i = 0; i < mutationCount; i++) {
	// 			const mutation = randInt(0, item.size - 1)
	// 			const joint = item.joints[mutation]

	// 			if (!joint.fixed) {
	// 				joint.position.add(new Vector2(Math.random() - 0.5, Math.random() - 0.5))
	// 			}
	// 		}

	// 		// if (Math.random() < 0.02) {
	// 		// 	if (Math.random() < 0.5) {
	// 		// 		const indexA = randInt(0, item.size - 1)
	// 		// 		const indexB = randInt(0, item.size - 1)

	// 		// 		const position = item.joints[indexA].position.clone().add(item.joints[indexB].position).divideScalar(2).add(new Vector2(Math.random() * 4 - 2, Math.random() * 4 - 2))

	// 		// 		item.addJoint(new Joint(position), [indexA, indexB])
	// 		// 	} else {
	// 		// 		const a = item.joints[randInt(0, item.size - 1)]
	// 		// 		if (!a.fixed) item.removeJoint(a.id)
	// 		// 	}
	// 		// }

	// 		return item
	// 	},
	// 	crossover: (item1: Truss, item2: Truss) => {
	// 		return (Math.random() > 0.5 ? item1 : item2).clone()
	// 	},
	// 	fitness: (item: Truss) => {
	// 		const success = item.computeForces()

	// 		let fitness = 0

	// 		// if (!success || !item.meetsConstraints(constraints)) fitness -= 1000

	// 		const joints = item.joints

	// 		let inefficiency = 0
	// 		for (let i = 0; i < joints.length; i++) {
	// 			const from = joints[i]
	// 			for (let j = i; j < joints.length; j++) {
	// 				const to = joints[j]
					
	// 				const force = item.getForce(from.id, to.id)
	// 				if (force) {
	// 					inefficiency += Math.abs((force > 0 ? constraints.maxCompression : constraints.maxTension) - force)
	// 				}
	// 			}
	// 		}

	// 		fitness -= joints.length**2
	// 		fitness += 1 / (inefficiency**2 + 0.01)

	// 		return fitness
	// 	},
	// 	initialPopulation: [bridge.clone()]
	// })

	// for (let i = 0; i < 100; i++) {
	// 	console.log("Generation: ", geneticAlgorithm.generation, "Best: ", geneticAlgorithm.best.item, "Worst: ", geneticAlgorithm.worst.item, "Avg Fitness: ", geneticAlgorithm.avgFitness)
	// 	geneticAlgorithm.evolve()
	// }

	// const best = geneticAlgorithm.best.item

	return (
		<ThemeProvider
			theme={{}}
		>
			<Box
				component={'div'}
				sx={{
					display: 'flex',
					width: '100vw',
					height: '100vh',
					alignItems: 'center',
				}}
			>
				<Visualizer
					truss={bridge}
				/>
			</Box>
		</ThemeProvider>
  	)
}

export default App
