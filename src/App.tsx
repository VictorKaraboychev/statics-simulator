import React, { useEffect, useRef, useState } from 'react'
import { Box } from '@mui/material'
import Viewer from './components/viewer/Viewer'
import { getGeneticAlgorithm } from './utility/trussy/the_algo'
import useCustomState, { useStateManager } from './state/state'
import GeneticAlgorithm from './utility/GeneticAlgorithm'
import Truss from './utility/Truss'

const App = () => {
	useStateManager(true)

    const { value: truss, set: setTruss } = useCustomState.current_truss()
    const { value: TRUSS_CONSTRAINTS } = useCustomState.truss_constraints()
    const { value: IS_GEN_RUNNING } = useCustomState.is_gen_running()
    const { set: setGeneration } = useCustomState.generation()

    const [refresh, setRefresh] = useState(false)

    const geneticAlgorithm = useRef<GeneticAlgorithm<Truss> | null>(null)

    useEffect(() => {
        if (!IS_GEN_RUNNING) {
            geneticAlgorithm.current = getGeneticAlgorithm(truss, TRUSS_CONSTRAINTS)
        }
    }, [truss, TRUSS_CONSTRAINTS, IS_GEN_RUNNING])

    useEffect(() => {
        if (IS_GEN_RUNNING && geneticAlgorithm.current) {
            const gen = geneticAlgorithm.current
            
            gen.evolve()
            console.log('Generation:', gen.generation, 'Best:', gen.best)

            setGeneration(gen.generation)
            setTruss(gen.best.item)
            setTimeout(() => {
                setRefresh(!refresh)
            }, 50)
        }
    }, [IS_GEN_RUNNING, refresh])

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
