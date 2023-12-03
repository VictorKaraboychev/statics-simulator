import { useEffect, useMemo } from 'react'
import { Box, createTheme, ThemeProvider, useMediaQuery } from '@mui/material'
import useCustomState, { useStateManager } from './state/state'
import { Outlet } from 'react-router-dom'
import { setCursor } from './utility/functions'

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

	useEffect(() => {
		setCursor('auto')
	}, [])

	return (
		<ThemeProvider theme={THEME}>
			<Box
				id={'scroll-view'}
				sx={{
					display: 'flex',
					flexDirection: 'column',
					position: 'relative',
					width: '100vw',
					height: '100vh',
					overflowX: 'hidden',
					overflowY: 'auto',
					alignItems: 'center',
					bgcolor: 'background.default',
				}}
			>
				<Outlet />
			</Box>
		</ThemeProvider>
	)
}

export default App
