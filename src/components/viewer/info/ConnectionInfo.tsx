import { Box, Button, Card, SxProps, Table, TableBody, TableCell, TableHead, TableRow, Theme, Typography } from '@mui/material'
import NumberField from '../../common/textfields/NumberField'
import { TrussConnectionDetailsType } from '../../../types/truss'
import Truss from '../../../utility/truss/Truss'
import { useCompoundState, useEventEffect, useReliantState } from '../../../utility/hooks'
import { fEngineering, fPercent } from '../../../utility/format'
import EngineeringField from '../../common/textfields/EngineeringField'
import Material from '../../../utility/truss/Material'

interface ConnectionInfoProps {
	sx?: SxProps<Theme>
	truss: Truss
	connectionDetails: TrussConnectionDetailsType
	onSubmit?: (truss: Truss) => void
}

const ConnectionInfo = (props: ConnectionInfoProps) => {
	const connectionDetails = props.connectionDetails
	const connection = props.truss.getConnection(connectionDetails.connection.id)
	const material = connection.material

	const [modifiedArea, setModifiedArea] = useReliantState<number>(connection.area, [props.connectionDetails, props.truss])
	const [modifiedMaterial, setModifiedMaterial] = useCompoundState<Material>(material, [props.connectionDetails, props.truss])

	const canSubmit = Boolean(
		connection &&
		(
			connection.area !== modifiedArea ||
			material.density !== modifiedMaterial.density ||
			material.youngsModulus !== modifiedMaterial.youngsModulus ||
			material.poissonsRatio !== modifiedMaterial.poissonsRatio ||
			material.ultimateStress.tension !== modifiedMaterial.ultimateStress.tension ||
			material.ultimateStress.compression !== modifiedMaterial.ultimateStress.compression
		)
	)

	const handleSubmit = () => {
		if (!connectionDetails || !connection) return

		connection.area = modifiedArea
		material.density = modifiedMaterial.density
		material.youngsModulus = modifiedMaterial.youngsModulus
		material.poissonsRatio = modifiedMaterial.poissonsRatio
		material.ultimateStress = modifiedMaterial.ultimateStress

		props.onSubmit?.(props.truss)
	}

	useEventEffect((e: KeyboardEvent) => {
		switch (e.key) {
			case 'Enter':
				handleSubmit()
				break
		}
	}, 'keydown')

	if (!connection) return null

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
					Mass: {fEngineering(connection.mass * 1e3, 'g')}
				</Typography>
				<Typography
					variant={'body2'}
				>
					Length: {fEngineering(connection.length, 'm')}
				</Typography>
				<Typography
					variant={'body2'}
				>
					Angle: {(connection.angle * (180 / Math.PI)).toFixed(2)}° {(connection.angle / Math.PI).toFixed(4)}π rad
				</Typography>
				<Box
					sx={{
						display: 'flex',
						flexDirection: 'row',
						alignItems: 'center',
					}}
				>
					<Typography
						variant={'body2'}
					>
						Force: {fEngineering(connection.force, 'N')} (
						<Typography
							sx={{
								fontWeight: 'bold',
								color: connection.stressType === 'tension' ? 'error.main' : 'success.main',
								textJustify: 'center',
								textTransform: 'capitalize',
							}}
							variant={'caption'}
						>
							{connection.stressType}
						</Typography>)
					</Typography>
				</Box>
				<Typography
					variant={'body2'}
				>
					Utilization: {fPercent(connection.utilization)} (FoS: {connection.utilization > 0 ? connection.safetyFactor.toFixed(2) : '0.00'}×)
				</Typography>
				<Table
					sx={{
						mb: 2,
					}}
					size={'small'}
				>
					<TableHead>
						<TableRow>
							<TableCell
								sx={{
									fontWeight: 'bold',
								}}
							>
								Property
							</TableCell>
							<TableCell
								sx={{
									fontWeight: 'bold',
									width: 100,
								}}
								align={'right'}
							>
								Axial
							</TableCell>
							<TableCell
								sx={{
									fontWeight: 'bold',
									width: 100,
								}}
								align={'right'}
							>
								Transverse
							</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						<TableRow>
							<TableCell>
								Stress
							</TableCell>
							<TableCell
								align={'right'}
							>
								{fEngineering(connection.axialStress, 'Pa')}
							</TableCell>
							<TableCell
								align={'right'}
							>
								{fEngineering(connection.transverseStress, 'Pa')}
							</TableCell>
						</TableRow>
						<TableRow>
							<TableCell>
								Strain
							</TableCell>
							<TableCell
								align={'right'}
							>
								{fPercent(connection.axialStrain, 4)}
							</TableCell>
							<TableCell
								align={'right'}
							>
								{fPercent(connection.transverseStrain, 4)}
							</TableCell>
						</TableRow>
						<TableRow>
							<TableCell>
								Elongation
							</TableCell>
							<TableCell
								align={'right'}
							>
								{fEngineering(connection.axialElongation, 'm')}
							</TableCell>
							<TableCell
								align={'right'}
							>
								{fEngineering(connection.transverseElongation, 'm')}
							</TableCell>
						</TableRow>
					</TableBody>
				</Table>
				<Box
					sx={{
						display: 'flex',
						flexDirection: 'row',
						alignItems: 'center',
						width: '100%',
					}}
				>
					<EngineeringField
						label={'Cross-Sectional Area'}
						size={'small'}
						baseUnit={'m²'}
						decimals={5}
						defaultValue={connection.area}
						onSubmit={setModifiedArea}
					/>
				</Box>
				<Typography
					sx={{
						my: 2,
						fontWeight: 'bold',
					}}
					variant={'body2'}
				>
					Material Properties
				</Typography>
				<Box
					sx={{
						display: 'flex',
						flexDirection: 'column',
						width: '100%',
					}}
				>
					<Box
						sx={{
							display: 'flex',
							flexDirection: 'row',
							alignItems: 'center',
							mb: 1,
							width: '100%',
						}}
					>
						<EngineeringField
							sx={{
								mr: 1,
							}}
							label={'Density'}
							size={'small'}
							baseUnit={'g/m³'}
							decimals={5}
							defaultValue={material.density * 1e3}
							onSubmit={(value) => setModifiedMaterial('density')(value / 1e3)}
						/>
						<NumberField
							label={'Poisson\'s Ratio'}
							size={'small'}
							decimals={5}
							defaultValue={material.poissonsRatio}
							onSubmit={setModifiedMaterial('poissonsRatio')}
						/>
					</Box>
					<Box
						sx={{
							display: 'flex',
							flexDirection: 'row',
							alignItems: 'center',
							mb: 1,
							width: '100%',
						}}
					>
						<EngineeringField
							sx={{
								mr: 1,
							}}
							label={'Young\'s Modulus'}
							size={'small'}
							baseUnit={'Pa'}
							decimals={5}
							defaultValue={material.youngsModulus}
							onSubmit={setModifiedMaterial('youngsModulus')}
						/>
						<EngineeringField
							label={'Shear Modulus'}
							size={'small'}
							baseUnit={'Pa'}
							decimals={5}
							defaultValue={material.shearModulus}
							onSubmit={setModifiedMaterial('shearModulus')}
						/>
					</Box>
					<Box
						sx={{
							display: 'flex',
							flexDirection: 'row',
							alignItems: 'center',
							mb: 1,
							width: '100%',
						}}
					>
						<EngineeringField
							sx={{
								mr: 1,
							}}
							label={'Ultimate Tensile Stress'}
							size={'small'}
							baseUnit={'Pa'}
							decimals={5}
							defaultValue={material.ultimateStress.tension}
							onSubmit={(value) => {
								setModifiedMaterial('ultimateStress')({
									tension: value,
									compression: material.ultimateStress.compression,
								})
							}}
						/>
						<EngineeringField
							label={'Ultimate Compressive Stress'}
							size={'small'}
							baseUnit={'Pa'}
							decimals={5}
							defaultValue={material.ultimateStress.compression}
							onSubmit={(value) => {
								setModifiedMaterial('ultimateStress')({
									tension: material.ultimateStress.tension,
									compression: value,
								})
							}}
						/>
					</Box>
				</Box>
				<Button
					sx={{
						mt: 1,
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

export default ConnectionInfo