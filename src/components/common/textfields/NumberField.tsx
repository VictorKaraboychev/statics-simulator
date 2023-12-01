import { useEffect, useRef, useState } from 'react'
import { InputAdornment, SxProps, TextField, Theme } from '@mui/material'
import { Range } from '../../../types/general'
import { isWithin, round } from '../../../utility/math'
import { useReliantState } from '../../../utility/hooks'
import { DEFAULT_INPUT_FIELD_DEBOUNCE } from '../../../config/CommonConfig'

interface NumberFieldProps {
	sx?: SxProps<Theme>, 
	label?: string,
	size?: 'small' | 'medium',
	defaultValue?: number,
	placeholder?: string,
	readOnly?: boolean,
	disabled?: boolean,
	helper?: string,
	decimals?: number,
	range?: Range,
	startComponent?: React.ReactNode,
	endComponent?: React.ReactNode,
	onChange?: (value: number) => void
	onSubmit?: (value: number) => void
}

const NumberField = (props: NumberFieldProps) => {
	const defaultValue = props.defaultValue ?? 0
	const [text, setText] = useReliantState((props.decimals === undefined ? defaultValue : round(defaultValue, props.decimals)).toString(), [props.defaultValue])

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
			if (valid) props.onSubmit?.(num)
		}, DEFAULT_INPUT_FIELD_DEBOUNCE)

		if (valid) props.onChange?.(num)
	}, [text])

	const handleChange = (text: string) => {
		setText(text)
	}

	return (
		<TextField
			sx={{
				"& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button": {
					display: "none",
				},
				"& input[type=number]": {
					MozAppearance: "textfield",
				},
				...props.sx,
			}}
			label={props.label}
			value={text}
			placeholder={props.placeholder}
			helperText={props.helper}
			size={props.size}
			variant={'outlined'}
			type={'number'}
			fullWidth={true}
			disabled={props.disabled}
			InputProps={{
				startAdornment: props.startComponent && (
					<InputAdornment position={'start'}>
						{props.startComponent}
					</InputAdornment>
				),
				endAdornment: props.endComponent && (
					<InputAdornment position={'end'}>
						{props.endComponent}
					</InputAdornment>
				),
				readOnly: props.readOnly,
			}}
			error={error}
			onChange={(e) => handleChange(e.target.value)}
		/>
	)
}

export default NumberField