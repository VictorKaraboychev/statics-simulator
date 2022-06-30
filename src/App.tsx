import React from 'react'
import { Box, ThemeProvider } from '@mui/material'
import Visualizer from './components/viewer/Visualizer'
import Truss from './utility/Truss'
import { Vector2 } from 'three'
import GeneticAlgorithm from './utility/GeneticAlgorithm'
import { randInt } from './utility/functions'
import Joint from './utility/Joint'

import { test_algo } from './utility/truss_me/the_algo'

function App() {

	const constraints = {
		minLength: 1,
		maxCompression: 4000,
		maxTension: 8000,
	}

    const spacing = -(15 / 5);
    const multiplier = 1;
    const force = -(75000 / 4);
    const offset = - 3;

    const bridge = new Truss([
        new Joint(new Vector2(0, 0), [new Vector2(1, 0), new Vector2(0, 1)]),
        new Joint(new Vector2(-spacing, 0), undefined, new Vector2(0, force)),
        new Joint(new Vector2(-spacing * 2, 0), undefined, new Vector2(0, force)),
        new Joint(new Vector2(-spacing * 3, 0), undefined, new Vector2(0, force)),
        new Joint(new Vector2(-spacing * 4, 0), undefined, new Vector2(0, force)),
        new Joint(new Vector2(15, 0), [new Vector2(0, 1)]),

        new Joint(new Vector2(-spacing , offset)),
        new Joint(new Vector2(7.5, offset)),
        new Joint(new Vector2(-spacing * 4, offset)),

    ], [
        [0, 1],
        [1, 2],
        [2, 3],
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

	console.log('Forces Computed: ', bridge.computeForces())

	// const algo_brig = test_algo(bridge)

    // const [algo_brig, setAlgoBrig] = React.useState(bridge)
    // React.useEffect(() => {
    //     setAlgoBrig(test_algo(bridge))
    // }
    // , [])
    
	// tension red, compression green
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
					//truss={algo_brig}
					truss={bridge}
				/>
			</Box>
		</ThemeProvider>
  	)
}

export default App
