import { useEffect, useRef, useState } from 'react'
import { Box, FormGroup, MenuItem, Select, SxProps, TextField, Theme } from '@mui/material'
import { METRIC_PREFIXES } from '../../../utility/format'

const getUnit = (unit: string, baseUnit: string) => {
	const prefix = unit.replace(baseUnit, '')
	return METRIC_PREFIXES.find(({ symbol }) => symbol === prefix)
}

interface EngineeringFieldProps {
	sx?: SxProps<Theme>,
	label: string,
	size?: 'small' | 'medium',
	baseUnit: string,
	defaultValue?: number,
	defaultUnit?: string,
	onChange?: (value: number) => void
	onSubmit?: (value: number) => void
}

const EngineeringField = (props: EngineeringFieldProps) => {
	const [text, setText] = useState(((props.defaultValue ?? 0) / 10 ** (getUnit(props.defaultUnit ?? props.baseUnit, props.baseUnit)?.exp ?? 0)).toString())
	const [unit, setUnit] = useState(props.defaultUnit ?? props.baseUnit)

	const [error, setError] = useState(false)

	const debounceRef = useRef<number>()

	useEffect(() => {
		if (debounceRef.current) clearTimeout(debounceRef.current)
		debounceRef.current = setTimeout(() => {
			const num = Number(text)

			const valid = !isNaN(num)
			setError(!valid)

			if (valid) props.onSubmit?.(num * 10 ** (getUnit(unit, props.baseUnit)?.exp ?? 0))
		}, 500)
	}, [text, unit, props.baseUnit])

	const handleChange = (text: string) => {
		setText(text)

		if (error) return

		const num = Number(text)
		props.onChange?.(num * 10 ** (getUnit(text, props.baseUnit)?.exp ?? 0))
	}

	const handleUnitChange = (value: string) => {
		setUnit(value)

		if (error) return

		const num = Number(text)
		props.onChange?.(num * 10 ** (getUnit(text, props.baseUnit)?.exp ?? 0))
	}

	return (
		<Box
			sx={props.sx}
		>
			<FormGroup
				sx={{
					display: 'flex',
					flexDirection: 'row',
					alignItems: 'center',
				}}
			>
				<TextField
					sx={{
						"& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button": {
							display: "none",
						},
						"& input[type=number]": {
							MozAppearance: "textfield",
						},
					}}
					label={props.label}
					value={text}
					size={props.size}
					variant={'outlined'}
					type={'number'}
					// fullWidth={true}
					error={error}
					onChange={(e) => handleChange(e.target.value)}
					onBlur={() => {
						console.log('blur')
					}}
					onFocus={() => {
						console.log('focus')
					}}
				/>
				<Select
					sx={{
						width: 75,
					}}
					variant={'standard'}
					disableUnderline={true}
					value={unit}
					onChange={(e) => handleUnitChange(e.target.value as string)}
				>
					{METRIC_PREFIXES.map(({ symbol }, i) => (
						<MenuItem
							key={i}
							sx={{
								textAlign: 'right',
							}}
							value={symbol + props.baseUnit}
						>
							{symbol}{props.baseUnit}
						</MenuItem>
					))}
				</Select>
			</FormGroup>
		</Box>
	)
}

export default EngineeringField