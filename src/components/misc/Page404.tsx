import { useEffect, useState } from 'react'
import { Box, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'

const Page404 = () => {
	const navigate = useNavigate()

	let [seconds, setSeconds] = useState(5)

	useEffect(() => {
		const interval = setInterval(() => {
			if (seconds > 0) {
				setSeconds(--seconds)
			} else {
				navigate('/')
			}
		}, 1000)
		return () => clearInterval(interval)
	}, [])

	return (
		<Box
			sx={{
				width: '100%',
				height: '100%',
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
			}}
		>
			<Typography
				sx={{
					fontWeight: 'bold',
					fontSize: 200,
				}}
				color={'primary'}
			>
				404
			</Typography>
			<Typography
				sx={{
					mt: -5,
				}}
				variant={'h3'}
				color={'primary'}
			>
				Page not found.
			</Typography>

			<Typography
				sx={{
					mt: 2
				}}
				variant={'h5'}
				color={'text.primary'}
			>
				Redirecting to the home page in {seconds} seconds...
			</Typography>
		</Box>
	)
}

export default Page404