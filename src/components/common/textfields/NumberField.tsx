import { SxProps, TextField, Theme } from '@mui/material'
import React, { useState } from 'react'
import { isNum } from '../../../utility/validators'

interface NumberFieldProps {
	sx?: SxProps<Theme>, 
	label?: string,
	size?: 'small' | 'medium',
	value?: number,
	defaultValue?: number,
	placeholder?: string,
	helper?: string,
	decimals?: number,
	range?: Range,
	onSubmit?: (value: number) => void
}

const NumberField = (props: NumberFieldProps) => {
	const [text, setText] = useState(props.defaultValue?.toString())

	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const value = event.target.value.replace(/[^0-9.\-]/g, '')
		setText(value)

		if (isNum(value)) props.onSubmit?.(Number(value))
	}

	return (
		<TextField
			sx={props.sx}
			label={props.label}
			size={props.size}
			value={props.value ?? text}
			placeholder={props.placeholder}
			helperText={props.helper}
			variant={'outlined'}
			fullWidth={true}
			onChange={handleChange}
		/>
	)
}

export default NumberField