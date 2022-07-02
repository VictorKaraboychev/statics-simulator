import React from 'react'
import { Box } from '@mui/material'
import Truss from './utility/Truss'
import { Vector2 } from 'three'
import GeneticAlgorithm from './utility/GeneticAlgorithm'
import { randInt } from './utility/functions'
import Joint, { FIXTURE } from './utility/Joint'
import Viewer from './components/viewer/Viewer'

import { test_algo } from './utility/trussy/the_algo'

function App() {
	const spacing = -3;
	const multiplier = 1;
	const force = -(75000 / 4);
	const offset = -3;

	const bridge = new Truss([
		new Joint(new Vector2(0, 0), FIXTURE.Pin),
		new Joint(new Vector2(-spacing, 0), undefined, new Vector2(0, force)),
		new Joint(new Vector2(-spacing * 2, 0), undefined, new Vector2(0, force)),
		new Joint(new Vector2(-spacing * 3, 0), undefined, new Vector2(0, force)),
		new Joint(new Vector2(-spacing * 4, 0), undefined, new Vector2(0, force)),
		new Joint(new Vector2(15, 0), FIXTURE.Roller), //5

		new Joint(new Vector2(-spacing, -offset)), //6
		new Joint(new Vector2(7.5, -offset + 3)),
		new Joint(new Vector2(-spacing * 4, -offset)), //8

		new Joint(new Vector2(7.5, -0.5)), //9

		new Joint(new Vector2(7.5, 0.5)), //10

		new Joint(new Vector2(7.5, 3)), //11
	], [
		[0, 1],
		[1, 2],
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

		[2, 11],
		[3, 11],

		[3, 8],
		[4, 8],
		[5, 8],

		[6, 11],
		[7, 11],
		[8, 11],

	], 4000 * multiplier, 8000 * multiplier)

    const [display, setDisplay] = React.useState(bridge)

    React.useEffect(() => {
        setDisplay(test_algo(bridge))
    }, [])
    
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
				truss={display}
			/>
		</Box>
	)
}

export default App
