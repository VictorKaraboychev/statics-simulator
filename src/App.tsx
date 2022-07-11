import React, { useEffect, useRef, useState } from 'react'
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

    const [refresh, setRefresh] = useState(false)

    const geneticAlgorithm = useRef(getGeneticAlgorithm(truss, { maxCompression: 8000, maxTension: 12000 }))

    useEffect(() => {
        if (IS_GEN_RUNNING) {
            const gen = geneticAlgorithm.current
            
            gen.evolve()
            console.log('Generation:', gen.generation, 'Best:', gen.best)

            setGeneration(gen.generation)
            setTruss(gen.best.item)
            setTimeout(() => {
                setRefresh(!refresh)
            }, 200)
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
