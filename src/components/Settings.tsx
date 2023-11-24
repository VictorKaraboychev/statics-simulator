import React, { useState } from 'react'
import { Box, Checkbox, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, SxProps, Theme, Typography } from '@mui/material'
import Dialog from './common/Dialog'
import NumberField from './common/textfields/NumberField'
import VERSION from '../version.json'
import useCustomState from '../state/state'
import TooltipButton from './common/TooltipButton'
import SettingsIcon from '@mui/icons-material/Settings'
import { THEME_OPTIONS } from '../config/GlobalConfig'
import EngineeringField from './common/textfields/EngineeringField'

interface SettingsProps {
	sx?: SxProps<Theme>,
}

const Settings = (props: SettingsProps) => {
	const { value: THEME, set: setTheme } = useCustomState.theme()
	const { value: GRID_SCALE, set: setGridScale } = useCustomState.grid_scale()
	const { value: TRUSS_PARAMETERS, set: setTrussConstraints } = useCustomState.truss_constraints()

	const [open, setOpen] = useState(false)

	return (
		<>
			<Dialog
				title={'Settings'}
				open={open}
				setOpen={setOpen}
			>
				<Box
					component={'div'}
					sx={{
						display: 'flex',
						flexDirection: 'column',
					}}
				>
					<FormControl
						sx={{
							mb: 2,
						}}
					>
						<Typography
							variant={'body2'}
							color={'text.primary'}
						>
							Theme
						</Typography>
						<RadioGroup
							value={THEME}
							onChange={(e) => setTheme(e.target.value as keyof typeof THEME_OPTIONS)}
						>
							{Object.entries(THEME_OPTIONS).map(([value, label]) => (
								<FormControlLabel
									key={value}
									value={value}
									label={label}
									control={
										<Radio
											sx={{
												my: -0.75
											}}
										/>
									}
								/>
							))}
						</RadioGroup>
					</FormControl>
					<Box
						component={'div'}
						sx={{
							display: 'flex',
							flexDirection: 'row',
							alignItems: 'center',
							mb: 2,
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
							Grid Scale:
						</Typography>
						<EngineeringField
							label={''}
							baseUnit={'m'}
							defaultValue={GRID_SCALE.scale}
							size={'small'}
							onSubmit={(value) => {
								setGridScale(value)
							}}
						/>
					</Box>
					<Box
						component={'div'}
						sx={{
							display: 'flex',
							flexDirection: 'row',
							alignItems: 'center',
							mb: 2,
						}}
					>
						<NumberField
							sx={{
								mr: 2,
							}}
							label={'Default Ultimate Compressive Stress (MPa)'}
							defaultValue={TRUSS_PARAMETERS.ultimateStress.compression * 1e-6}
							size={'small'}
							onSubmit={(value) => {
								setTrussConstraints({
									...TRUSS_PARAMETERS,
									ultimateStress: {
										...TRUSS_PARAMETERS.ultimateStress,
										compression: value,
									},
								})
							}}
						/>
						<NumberField
							label={'Default Ultimate Tensile Stress (MPa)'}
							defaultValue={TRUSS_PARAMETERS.ultimateStress.tension * 1e-6}
							size={'small'}
							onSubmit={(value) => {
								setTrussConstraints({
									...TRUSS_PARAMETERS,
									ultimateStress: {
										...TRUSS_PARAMETERS.ultimateStress,
										tension: value,
									},
								})
							}}
						/>
					</Box>
					{/* <NumberField
						sx={{
							mb: 2,
						}}
						label={'Distributed Force (N/m)'}
						size={'small'}
						defaultValue={TRUSS_PARAMETERS.distributedForce}
						onSubmit={(value) => {
							setTrussConstraints({
								...TRUSS_PARAMETERS,
								distributedForce: value,
							})
						}}
					/> */}
					<Typography
						variant={'body2'}
						color={'text.primary'}
					>
						Version: {VERSION.version}
					</Typography>
					<Typography
						variant={'body2'}
						color={'text.primary'}
					>
						Date Updated: {new Date(VERSION.date).toLocaleString(undefined, {
							day: 'numeric',
							month: 'short',
							year: 'numeric',
						})}
					</Typography>
				</Box>
			</Dialog>
			<TooltipButton
				sx={{
					backgroundColor: 'primary.main',
					'&:hover': {
						backgroundColor: 'primary.dark',
					},
					...props.sx,
				}}
				label={'Settings'}
				size={'large'}
				onClick={() => setOpen(true)}
			>
				<SettingsIcon />
			</TooltipButton>
		</>
	)
}

export default Settings