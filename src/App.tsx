import React, { useEffect, useRef } from 'react'
import { Box } from '@mui/material'
import Viewer from './components/viewer/Viewer'
import { getGeneticAlgorithm } from './utility/trussy/the_algo'
import useCustomState, { useStateManager } from './state/state'

const App = () => {
	useStateManager(true)

    const { value: truss, set: setTruss } = useCustomState.current_truss()
    const { value: TRUSS_CONSTRAINTS } = useCustomState.truss_constraints()
    const { value: IS_GEN_RUNNING } = useCustomState.is_gen_running()
    const { set: setGeneration } = useCustomState.generation()

    const geneticAlgorithm = useRef(getGeneticAlgorithm(truss, TRUSS_CONSTRAINTS))

    // useEffect(() => {
    //     if (IS_GEN_RUNNING) {
    //         const gen = geneticAlgorithm.current
    //         for (let i = 0; i < 10; i++) {
    //             gen.evolve()
    //             console.log('Generation:', gen.generation, 'Best:', gen.best.fitness)
    //         }
    //         setGeneration(gen.generation)
    //         setTruss(gen.best.item)
    //     }
    // }, [truss, IS_GEN_RUNNING])

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
			<Viewer/>
		</Box>
	)
}

export default App
