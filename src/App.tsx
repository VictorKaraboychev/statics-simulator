import { useMemo } from 'react'
import { Box, createTheme, ThemeProvider, useMediaQuery } from '@mui/material'
import Viewer from './components/viewer/Viewer'
import useCustomState, { useStateManager } from './state/state'

const App = () => {
	useStateManager(true)

	const { value: THEME_TYPE } = useCustomState.theme()

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
				<Viewer />
			</Box>
		</ThemeProvider>
	)
}

export default App
