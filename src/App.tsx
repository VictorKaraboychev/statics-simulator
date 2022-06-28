import React from 'react'
import { Box, ThemeProvider } from '@mui/material'
import Visualizer from './components/viewer/Visualizer'
import Truss, { Joint } from './utility/Truss'
import { Vector2 } from 'three'
import GeneticAlgorithm from './utility/GeneticAlgorithm'
import { randInt } from './utility/functions'

function App() {

	const constraints = {
		minLength: 1,
		maxCompression: 4000,
		maxTension: 8000,
	}


	// const startingTruss = new Truss([
	// 	new Joint(new Vector2(0, 2), undefined, new Vector2(0, -7000)),
	// 	new Joint(new Vector2(2, 2), [new Vector2(1, 0), new Vector2(0, 1)]),
	// 	new Joint(new Vector2(2, 0), [new Vector2(1, 0)]),
	// 	new Joint(new Vector2(1, 1), undefined, new Vector2(0, -7000)),
	// ], [
	// 	[0, 1],
	// 	[0, 3],
	// 	[1, 2],
	// 	[1, 3],
	// 	[2, 3],
	// ], 20000, 20000)

	const bridge = new Truss([
		new Joint(new Vector2(0, 0), [new Vector2(1, 0), new Vector2(0, 1)]),
		new Joint(new Vector2(2.5, 0), undefined, new Vector2(0, -15000)),
		new Joint(new Vector2(5, 0), undefined, new Vector2(0, -15000)),
		new Joint(new Vector2(7.5, 0), undefined, new Vector2(0, -15000)),
		new Joint(new Vector2(10, 0), undefined, new Vector2(0, -15000)),
		new Joint(new Vector2(12.5, 0), undefined, new Vector2(0, -15000)),
		new Joint(new Vector2(15, 0), [new Vector2(0, 1)]),

		new Joint(new Vector2(1.25, 2)),
		new Joint(new Vector2(3.75, 2)),
		new Joint(new Vector2(6.25, 2)),
		new Joint(new Vector2(8.75, 2)),
		new Joint(new Vector2(11.25, 2)),
		new Joint(new Vector2(13.75, 2)),
	], [
		[0, 1],
		[1, 2],
		[2, 3],
		[3, 4],
		[4, 5],
		[5, 6],
		[0, 7],
		[1, 7],
		[1, 8],
		[2, 8],
		[2, 9],
		[3, 9],
		[3, 10],
		[4, 10],
		[4, 11],
		[5, 11],
		[5, 12],
		[6, 12],
		[7, 8],
		[8, 9],
		[9, 10],
		[10, 11],
		[11, 12],
	], 20000, 20000)
	
	console.log(bridge.computeForces())

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

	// 		if (!success || !item.meetsConstraints(constraints)) fitness -= 1000

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
	// 	initialPopulation: [bridge]
	// })

	// for (let i = 0; i < 10; i++) {
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
