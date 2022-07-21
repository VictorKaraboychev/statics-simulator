import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Box, createTheme, ThemeProvider, useMediaQuery } from '@mui/material'
import Viewer from './components/viewer/Viewer'
import { getGeneticAlgorithm } from './utility/trussy/the_algo'
import useCustomState, { useStateManager } from './state/state'
import GeneticAlgorithm from './utility/GeneticAlgorithm'
import Truss from './utility/Truss'

const App = () => {
	useStateManager(true)

    const { value: THEME_TYPE } = useCustomState.theme()
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

    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')

    let THEME = useMemo(
		() => createTheme({
			palette: {
				mode: THEME_TYPE === 'system' ? prefersDarkMode ? 'dark' : 'light' : THEME_TYPE,
				primary: {
					light: '#63ccff',
					main: '#009be5',
					dark: '#006db3',
				},
				secondary: {
					light: '#152336',
					main: '#101F33',
					dark: '#081627',
				}
			},
			typography: {
				h5: {
					fontWeight: 500,
					fontSize: 26,
					letterSpacing: 0.5,
				},
			},
			shape: {
				borderRadius: 8,
			},
			components: {
				MuiTab: {
					defaultProps: {
						disableRipple: true,
					},
				},
			},
			mixins: {
				toolbar: {
					minHeight: 48,
				},
			},
		}),
		[prefersDarkMode, THEME_TYPE],
	)


	return (
        <ThemeProvider theme={THEME}>
            <Box
                component={'div'}
                sx={{
                    display: 'flex',
                    width: '100vw',
                    height: '100vh',
                    alignItems: 'center',
                    bgcolor: 'background.default',
                }}
            >
                <Viewer/>
            </Box>
        </ThemeProvider>
	)
}

export default App
