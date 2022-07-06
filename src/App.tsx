import React from 'react'
import { Box } from '@mui/material'
import Viewer from './components/viewer/Viewer'
import { test_algo } from './utility/trussy/the_algo'
import { useStateManager } from './state/state'

function App() {
	useStateManager(true)

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
			<Viewer/>
		</Box>
	)
}

export default App
