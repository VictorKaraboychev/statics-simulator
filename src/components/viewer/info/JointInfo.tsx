import { Box, Button, Card, Checkbox, FormControlLabel, SxProps, TextField, Theme, Typography } from '@mui/material'
import NumberField from '../../common/textfields/NumberField'
import { round } from '../../../utility/math'
import { TrussJointDetailsType } from '../../../types/truss'
import { FIXTURE } from '../../../utility/truss/Joint'
import { Vector2 } from 'three'
import { useEventEffect, useReliantState } from '../../../utility/hooks'
import Truss from '../../../utility/truss/Truss'
import { roundVector2 } from '../../../utility/functions'
import { DEFAULT_PRECISION } from '../../../config/GlobalConfig'

interface JointInfoProps {
	sx?: SxProps<Theme>
	truss: Truss
	jointDetails: TrussJointDetailsType
	onSubmit?: (truss: Truss) => void
}

const JointInfo = (props: JointInfoProps) => {
	const jointDetails = props.jointDetails
	const joint = props.truss.getJoint(jointDetails.joint.id)

	const [position, setPosition] = useReliantState<Vector2>(joint ? joint.position : new Vector2(0, 0), [props.jointDetails, props.truss])
	const [externalForce, setExternalForce] = useReliantState<Vector2>(joint ? joint.externalForce : new Vector2(0, 0), [props.jointDetails, props.truss])

	const canSubmit = Boolean(
		joint &&
		!position.equals(joint.position) ||
		!externalForce.equals(joint.externalForce)
	)

	const handleSubmit = () => {
		if (!canSubmit || !joint) return

		joint.position = roundVector2(position, DEFAULT_PRECISION)
		joint.externalForce = roundVector2(externalForce, DEFAULT_PRECISION)

		props.onSubmit?.(props.truss)
	}

	useEventEffect((e: KeyboardEvent) => {
		switch (e.key) {
			case 'Enter':
				handleSubmit()
				break
		}
	}, 'keydown')

	// console.log('JOINT: ', joint, jointDetails.joint.id, props.truss)

	if (!joint) return null

	return (
		<Card
			sx={{
				boxShadow: 5,
				width: 400,
				p: 2,
				...props.sx,
			}}
			variant={'outlined'}
		>
			<Box
				sx={{
					display: 'flex',
					flexDirection: 'column',
					height: '100%',
				}}
			>
				<Typography
					sx={{
						fontWeight: 'bold',
					}}
					variant={'body1'}
				>
					Joint Details
				</Typography>
				<Typography
					variant={'body2'}
				>
					ID: {jointDetails.id}
				</Typography>
				<Typography
					sx={{
						mb: 1,
					}}
					variant={'body2'}
				>
					Connections: {jointDetails.joint.numConnections}
				</Typography>
				<Box
					component={'div'}
					sx={{
						display: 'flex',
						flexDirection: 'row',
						alignItems: 'center',
						mb: 1,
					}}
				>
					<Typography
						sx={{
							mr: 'auto',
							minWidth: 125,
						}}
						variant={'body2'}
						noWrap={true}
					>
						Fixed:
					</Typography>
					<FormControlLabel
						sx={{
							width: '100%'
						}}
						label={'X'}
						control={
							<Checkbox
								checked={joint?.fixtures.x}
								onChange={(e) => {
									if (!joint) return
									joint.fixtures.x = e.currentTarget.checked
									joint.externalForce.x = 0
									props.onSubmit?.(props.truss)
								}}
							/>
						}
					/>
					<FormControlLabel
						sx={{
							width: '100%'
						}}
						label={'Y'}
						control={
							<Checkbox
								checked={joint?.fixtures.y}
								onChange={(e) => {
									if (!joint) return
									joint.fixtures.y = e.currentTarget.checked
									joint.externalForce.y = 0
									props.onSubmit?.(props.truss)
								}}
							/>
						}
					/>
				</Box>
				<Box
					component={'div'}
					sx={{
						display: 'flex',
						flexDirection: 'row',
						alignItems: 'center',
						mb: 1,
					}}
				>
					<Typography
						sx={{
							mr: 'auto',
							minWidth: 125,
						}}
						variant={'body2'}
						noWrap={true}
					>
						Position:
					</Typography>
					<NumberField
						sx={{
							mr: 0.5,
						}}
						label={'X'}
						value={round(position.x, 5)}
						size={'small'}
						onSubmit={(value) => setPosition(new Vector2(value, position.y))}
					/>
					<NumberField
						sx={{
						}}
						label={'Y'}
						value={round(position.y, 5)}
						size={'small'}
						onSubmit={(value) => setPosition(new Vector2(position.x, value))}

					/>
				</Box>
				<Box
					component={'div'}
					sx={{
						display: 'flex',
						flexDirection: 'row',
						alignItems: 'center',
						mb: 1,
					}}
				>
					<Typography
						sx={{
							mr: 'auto',
							minWidth: 125,
						}}
						variant={'body2'}
						noWrap={true}
					>
						External Forces:
					</Typography>
					<TextField
						sx={{
							mr: 0.5,
						}}
						type={'number'}
						label={'X'}
						value={round(externalForce.x, 5)}
						size={'small'}
						variant={'outlined'}
						disabled={joint.fixtures.x}
						onChange={(e) => setExternalForce(new Vector2(Number(e.target.value), externalForce.y))}
					/>
					<TextField
						sx={{
						}}
						type={'number'}
						label={'Y'}
						value={round(externalForce.y, 5)}
						size={'small'}
						variant={'outlined'}
						disabled={joint.fixtures.y}
						onChange={(e) => setExternalForce(new Vector2(externalForce.x, Number(e.target.value)))}
					/>
				</Box>
				<Button
					sx={{
						mt: 'auto',
					}}
					disabled={!canSubmit}
					fullWidth={true}
					variant={'contained'}
					onClick={handleSubmit}
				>
					Save
				</Button>
			</Box>
		</Card>
	)
}

export default JointInfo