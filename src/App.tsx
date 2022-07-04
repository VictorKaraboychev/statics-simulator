import React, { useRef, useState, useEffect } from 'react'
import { Box } from '@mui/material'
import Truss from './utility/Truss'
import { Vector2 } from 'three'
import GeneticAlgorithm from './utility/GeneticAlgorithm'
import { randInt } from './utility/functions'
import Joint, { FIXTURE } from './utility/Joint'
import Viewer from './components/viewer/Viewer'

import { test_algo } from './utility/trussy/the_algo'
import { delay } from './utility/math'

function App() {
    const bridge = new Truss([
        new Joint(new Vector2(0, 0), [new Vector2(1, 0), new Vector2(0, 1)]),
        new Joint(new Vector2(2.5, 0), undefined, new Vector2(0, -15000)),
        new Joint(new Vector2(5, 0), undefined, new Vector2(0, -15000)),
        new Joint(new Vector2(7.5, 0), undefined, new Vector2(0, -15000)),
        new Joint(new Vector2(10, 0), undefined, new Vector2(0, -15000)),
        new Joint(new Vector2(12.5, 0), undefined, new Vector2(0, -15000)),
        new Joint(new Vector2(15, 0), [new Vector2(0, 1)]), // 6

        new Joint(new Vector2(1.25, -3)),
        new Joint(new Vector2(3.75, -3)),
        new Joint(new Vector2(6.25, -3)),
        new Joint(new Vector2(8.75, -3)),
        new Joint(new Vector2(11.25, -3)),
        new Joint(new Vector2(13.75, -3)), // 12

        new Joint(new Vector2(2.5, -6)),
        new Joint(new Vector2(5, -6)),
        new Joint(new Vector2(7.5, -6)),
        new Joint(new Vector2(10, -6)),
        new Joint(new Vector2(12.5, -6)), // 17

        new Joint(new Vector2(0, -1.5)),
        new Joint(new Vector2(1, -1.5)), // 19

        new Joint(new Vector2(14, -1.5)),
        new Joint(new Vector2(15, -1.5)), // 21

        // new Joint(new Vector2(3.75, -9)),
        // new Joint(new Vector2(6.25, -9)),
        // new Joint(new Vector2(8.75, -9)), 
        // new Joint(new Vector2(11.25, -9)), // 21

        // new Joint(new Vector2(5, 12)),
        // new Joint(new Vector2(7.5, 12)),
        // new Joint(new Vector2(10, 12)), // 24

        // new Joint(new Vector2(6.25, 15)),
        // new Joint(new Vector2(8.75, 15)), // 26

        // new Joint(new Vector2(7.5, 18)), // 27
    ], [
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 4],
		[4, 5],
        [5, 6],

        [7, 8],
        [8, 9],
        [9, 10],
        [10, 11],
        [11, 12],

        [13, 14],
        [14, 15],
        [15, 16],
        [16, 17],

        // [18, 19],
        // [18, 19],
		// [19, 20],
		// [20, 21],

		// [22, 23],
		// [23, 24],

		// [25, 26],

		// [0, 7],
        [0, 18],
        [0, 19],
        [18, 19],
        [7, 18],
        [7, 19],
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
		// [6, 12],
        [6, 20],
        [6, 21],
        [20, 21],
        [12, 20],
        [12, 21],


		[7, 13],
		[8, 13],
		[8, 14],
		[9, 14],
		[9, 15],
		[10, 15],
		[10, 16],
		[11, 16],
		[11, 17],
		[12, 17],



		// [13, 18],
		// [14, 18],
		// [14, 19],
		// [15, 19],
		// [15, 20],
		// [16, 20],
		// [16, 21],
		// [17, 21],

		// [18, 22],
		// [19, 22],
		// [19, 23],
		// [20, 23],
		// [20, 24],
		// [21, 24],

		// [22, 25],
		// [23, 25],
		// [23, 26],
		// [24, 26],

		// [25, 27],
		// [26, 27],

    ], 4000, 8000)

    // const computeRef = useRef(false)
    // const [display, setDisplay] = useState<Truss | null>(null)

    // useEffect(() => { 
    //     (async () => {
    //         if (!computeRef.current) {
    //             const gen = test_algo(bridge)
    //             console.log(gen)
    //             for (let i = 0; i < 200; i++) {
    //                 gen.evolve()
    //                 console.log("Generation: ", gen.generation, "Avg Fitness: ", gen.avgFitness.toFixed(0))
    //                 if (i % 10 === 0) {
    //                     setDisplay(gen.best.item.clone())
    //                     // await delay(2000)
    //                 }
    //             }
    //             computeRef.current = true
    //         }
    //     })()
    // }, [])

    // if (!display) return null
    
	return (
		<Box
			component={'div'}
			sx={{
				display: 'flex',
				width: '100vw',
				height: '100vh',
				alignItems: 'center',
			}}
		>
			<Viewer
				truss={bridge}
			/>
		</Box>
	)
}

export default App
