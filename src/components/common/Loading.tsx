import { CircularProgress } from '@mui/material'

const Loading = () => {
	return (
		<CircularProgress
			sx={{
				position: 'absolute',
				top: '50%',
				left: '50%',
				transform: 'translate(-50%, -50%)',
				p: 10,
			}}
		/>
	)
}

export default Loading