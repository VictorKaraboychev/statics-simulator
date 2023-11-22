import React from 'react'
import { Box, Button, Card, Checkbox, FormControlLabel, SxProps, TextField, Theme, Typography } from '@mui/material'
import { TrussConnectionDetailsType, TrussJointDetailsType } from '../../types/truss'
import Truss from '../../utility/truss/Truss'
import { Vector2 } from 'three'
import { useEventEffect, useReliantState } from '../../utility/hooks'
import { roundVector2 } from '../../utility/functions'
import { DEFAULT_PRECISION } from '../../config/GlobalConfig'
import { round } from '../../utility/math'
import { FIXTURE } from '../../utility/truss/Joint'
import NumberField from '../common/textfields/NumberField'

interface TrussInfoProps {
	sx?: SxProps<Theme>,
	truss: Truss,
	connectionDetails: TrussConnectionDetailsType | null,
	jointDetails: TrussJointDetailsType | null,
	onSubmit?: (truss: Truss) => void,
}

const TrussInfo = (props: TrussInfoProps) => {
	const joints = props.truss.joints

	const [position, setPosition] = useReliantState<Vector2>(props.jointDetails ? joints[props.jointDetails?.id].position : new Vector2(0, 0), [props.jointDetails, props.truss])
	const [externalForce, setExternalForce] = useReliantState<Vector2>(props.jointDetails ? joints[props.jointDetails?.id].externalForce : new Vector2(0, 0), [props.jointDetails, props.truss])

	const [multiplier, setMultiplier] = useReliantState<number>(props.connectionDetails?.multiplier || 1, [props.connectionDetails])

	const connectionDetails = props.connectionDetails
	const jointDetails = props.jointDetails

	const joint = jointDetails ? joints[jointDetails.id] : null

	const canSubmit = Boolean(
		(jointDetails && (!joint?.position.equals(position) || !joint?.externalForce.equals(externalForce))) ||
		(connectionDetails && connectionDetails.multiplier !== multiplier)
	)

	const handleSubmit = () => {
		if (jointDetails && joint) {
			joint.position = roundVector2(position, DEFAULT_PRECISION)
			joint.externalForce = roundVector2(externalForce, DEFAULT_PRECISION)
		} else if (connectionDetails) {
			const [a, b] = connectionDetails.id.split('-').map(Number)
			joints[a].connections[joints[b].id].multiplier = multiplier
			const connection = props.truss.connections.find(([aC, bC]) => (aC === a && bC === b) || (aC === b && bC === a))
			if (connection) connection[2] = multiplier
		} else {
			return
		}

		props.onSubmit?.(props.truss)
	}

	useEventEffect((e: KeyboardEvent) => {
		if (!jointDetails && !connectionDetails) return
		switch (e.key) {
			case 'Enter':
				handleSubmit()
				break
		}
	}, 'keydown')

	if (!connectionDetails && !jointDetails) return null

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
				component={'div'}
				sx={{
					display: 'flex',
					flexDirection: 'column',
					height: '100%',
				}}
			>
				{connectionDetails && (
					<>
						<Typography
							sx={{
								fontWeight: 'bold',
							}}
							variant={'body1'}
						>
							Connection Details
						</Typography>
						<Typography
							variant={'body2'}
						>
							ID: {connectionDetails.id}
						</Typography>
						<Typography
							variant={'body2'}
						>
							Length: {connectionDetails.length.toFixed(4)}m
						</Typography>
						<Typography
							variant={'body2'}
						>
							Angle: {(connectionDetails.angle * (180 / Math.PI)).toFixed(4)}° {(connectionDetails.angle / Math.PI).toFixed(4)}π rad
						</Typography>
						<Typography
							variant={'body2'}
						>
							Force: {Math.ceil(connectionDetails.force || 0)?.toFixed(0)}N
						</Typography>
						<Typography
							variant={'body2'}
						>
							Stress: {Math.abs(connectionDetails.stress * 100).toFixed(0)}%{connectionDetails.multiplier > 1 && ` ×${connectionDetails.multiplier}`}
						</Typography>
						<Box
							component={'div'}
							sx={{
								display: 'flex',
								flexDirection: 'row',
								alignItems: 'center',
								mb: 1,
								width: '100%',
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
								Multiplier:
							</Typography>
							<NumberField
								label={'Multiplier'}
								value={multiplier}
								size={'small'}
								onSubmit={setMultiplier}
							/>
						</Box>
					</>
				)}
				{jointDetails && (
					<>
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
							Connections: {jointDetails.joint.connections_count}
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
								label={'Pin'}
								control={
									<Checkbox
										checked={joint?.fixtures.length == 2}
										onChange={(e) => {
											if (!joint) return
											if (e.currentTarget.checked) {
												joint.fixtures = FIXTURE.Pin
											} else {
												joint.fixtures = []
											}
											props.onSubmit?.(props.truss)
										}}
									/>
								}
							/>
							<FormControlLabel
								sx={{
									width: '100%'
								}}
								label={'Roller'}
								control={
									<Checkbox
										checked={joint?.fixtures.length == 1}
										onChange={(e) => {
											if (!joint) return
											if (e.currentTarget.checked) {
												joint.fixtures = FIXTURE.Roller
											} else {
												joint.fixtures = []
											}
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
								// disabled={(joint?.fixtures.length ?? 0) > 0}
								disabled={true}
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
								// disabled={(joint?.fixtures.length ?? 0) > 0}
								disabled={true}
								onChange={(e) => setExternalForce(new Vector2(externalForce.x, Number(e.target.value)))}
							/>
						</Box>
					</>
				)}
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

export default TrussInfo