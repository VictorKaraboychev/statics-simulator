import { useEffect, useRef, useState } from 'react'
import { Box, MenuItem, Select, SxProps, TextField, Theme } from '@mui/material'
import { autoUnit, getUnit, isWithin, round } from '../../../utility/math'
import { Range } from '../../../types/general'
import { METRIC_PREFIXES } from '../../../config/GlobalConfig'
import { useReliantState } from '../../../utility/hooks'
import { DEFAULT_INPUT_FIELD_DEBOUNCE } from '../../../config/CommonConfig'

interface EngineeringFieldProps {
	sx?: SxProps<Theme>,
	label: string,
	size?: 'small' | 'medium',
	placeholder?: string,
	readOnly?: boolean,
	disabled?: boolean,
	helper?: string,
	baseUnit: string,
	defaultValue?: number,
	decimals?: number,
	range?: Range,
	onChange?: (value: number) => void
	onSubmit?: (value: number) => void
}

const EngineeringField = (props: EngineeringFieldProps) => {
	const { value: defaultValue, unit: defaultUnit } = autoUnit(props.defaultValue ?? 0, props.baseUnit)

	const [text, setText] = useReliantState((props.decimals === undefined ? defaultValue : round(defaultValue, props.decimals)).toString(), [props.defaultValue])
	const [unit, setUnit] = useReliantState(defaultUnit, [props.defaultValue, props.baseUnit])

	const [error, setError] = useState(false)

	const debounceRef = useRef<number>()

	const isValid = (value: number) => {
		if (isNaN(value)) return false

		// if (props.decimals) {
		// 	const [int, dec] = value.toString().split('.')
		// 	if (dec?.length > props.decimals) return false
		// }

		if (props.range && !isWithin(value, props.range)) return false

		return true
	}

	useEffect(() => {
		let num = Number(text)
		const valid = isValid(num)

		if (props.decimals) num = round(num, props.decimals)

		if (debounceRef.current) clearTimeout(debounceRef.current)
		debounceRef.current = setTimeout(() => {
			setError(!valid)
			if (valid) props.onSubmit?.(num * 10 ** (getUnit(unit, props.baseUnit).exp))
		}, DEFAULT_INPUT_FIELD_DEBOUNCE)

		if (valid) props.onChange?.(num * 10 ** (getUnit(unit, props.baseUnit).exp))
	}, [text, unit, props.baseUnit])

	const handleChange = (text: string) => {
		setText(text)
	}

	const handleUnitChange = (value: string) => {
		setUnit(value)
	}

	return (
		<Box
			sx={{
				display: 'flex',
				flexDirection: 'row',
				alignItems: 'start',
				width: '100%',
				...props.sx
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
				placeholder={props.placeholder}
				helperText={error && "Invalid value"}
				value={text}
				size={props.size}
				fullWidth={true}
				disabled={props.disabled}
				variant={'outlined'}
				type={'number'}
				InputProps={{
					sx: {
						pr: '75px',
					},
					readOnly: props.readOnly,
				}}
				error={error}
				onChange={(e) => handleChange(e.target.value)}
			/>
			<Select
				sx={{
					width: 75,
					textAlign: 'end',
					mt: props.size === 'small' ? 0.75 : 1.5,
					ml: '-75px',
				}}
				variant={'standard'}
				size={props.size}
				disableUnderline={true}
				disabled={props.disabled}
				readOnly={props.readOnly}
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
		</Box>
	)
}

export default EngineeringField