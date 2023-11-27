import { useState } from 'react'
import { Box, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, SxProps, Theme, Typography } from '@mui/material'
import Dialog from './common/Dialog'
import VERSION from '../version.json'
import useCustomState from '../state/state'
import TooltipButton from './common/TooltipButton'
import SettingsIcon from '@mui/icons-material/Settings'
import { THEME_OPTIONS } from '../config/GlobalConfig'
import EngineeringField from './common/textfields/EngineeringField'
import NumberField from './common/textfields/NumberField'

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
							sx={{
								mb: 1,
								fontWeight: 'bold',
							}}
							variant={'body2'}
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
					<Typography
						sx={{
							mb: 2,
							fontWeight: 'bold',
						}}
						variant={'body2'}
					>
						Editor Settings
					</Typography>
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

						<EngineeringField
							sx={{
								mr: 2,
							}}
							label={'Grid Scale'}
							size={'small'}
							baseUnit={'m'}
							disabled={true}
							defaultValue={GRID_SCALE.scale}
							onSubmit={(value) => {
								setGridScale({
									...GRID_SCALE,
									scale: value,
								})
							}}
						/>
						<EngineeringField
							label={'Default Cross-Sectional Area'}
							size={'small'}
							baseUnit={'m²'}
							decimals={5}
							defaultValue={TRUSS_PARAMETERS.area}
							onSubmit={(value) => {
								setTrussConstraints({
									...TRUSS_PARAMETERS,
									area: value,
								})
							}}
						/>
					</Box>
					<Typography
						sx={{
							mb: 2,
							fontWeight: 'bold',
						}}
						variant={'body2'}
					>
						Default Material Properties
					</Typography>
					<Box
						component={'div'}
						sx={{
							display: 'flex',
							flexDirection: 'row',
							alignItems: 'center',
							mb: 2,
						}}
					>
						<EngineeringField
							sx={{
								mr: 2,
							}}
							label={'Default Density'}
							size={'small'}
							baseUnit={'g/m³'}
							decimals={5}
							defaultValue={TRUSS_PARAMETERS.density * 1e3}
							onSubmit={(value) => {
								setTrussConstraints({
									...TRUSS_PARAMETERS,
									density: value / 1e3,
								})
							}}
						/>
						<NumberField
							label={'Default Poisson\'s Ratio'}
							size={'small'}
							decimals={5}
							defaultValue={TRUSS_PARAMETERS.poissonsRatio}
							onSubmit={(value) => {
								setTrussConstraints({
									...TRUSS_PARAMETERS,
									poissonsRatio: value,
								})
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
						<EngineeringField
							sx={{
								mr: 2,
							}}
							label={'Default Young\'s Modulus'}
							size={'small'}
							baseUnit={'Pa'}
							decimals={5}
							defaultValue={TRUSS_PARAMETERS.youngsModulus}
							onSubmit={(value) => {
								setTrussConstraints({
									...TRUSS_PARAMETERS,
									youngsModulus: value,
								})
							}}
						/>
						<EngineeringField
							label={'Default Shear Modulus'}
							size={'small'}
							baseUnit={'Pa'}
							decimals={5}
							defaultValue={TRUSS_PARAMETERS.shearModulus}
							onSubmit={(value) => {
								setTrussConstraints({
									...TRUSS_PARAMETERS,
									shearModulus: value,
								})
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
						<EngineeringField
							sx={{
								mr: 2,
							}}
							label={'Default Ultimate Compressive Stress'}
							size={'small'}
							baseUnit={'Pa'}
							decimals={5}
							defaultValue={TRUSS_PARAMETERS.ultimateStress.compression}
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
						<EngineeringField
							label={'Default Ultimate Tensile Stress'}
							size={'small'}
							baseUnit={'Pa'}
							decimals={5}
							defaultValue={TRUSS_PARAMETERS.ultimateStress.tension}
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
					<Typography
						variant={'body2'}
						color={'text.primary'}
					>
						GitHub:
						<a 
							style={{ 
								marginLeft: '0.25rem',
								color: 'inherit',
							}}
							href={'https://github.com/VictorKaraboychev/statics-simulator'} target={'_blank'}
						>
							Victor Karaboychev
						</a>
					</Typography>
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