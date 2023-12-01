import React, { KeyboardEvent, useRef, useState } from 'react'
import { InputAdornment, SxProps, TextField as TextFieldMUI, Theme } from '@mui/material'
import { DEFAULT_INPUT_FIELD_DEBOUNCE } from '../../../config/CommonConfig'

interface ValidatedTextFieldInterface {
	sx?: SxProps<Theme>, 
	label?: string,
	size?: 'small' | 'medium',
	value?: string,
	variant?: 'standard' | 'filled' | 'outlined',
	placeholder?: string,
	defaultValue?: string,
	type?: React.HTMLInputTypeAttribute,
	optional?: boolean,
	multiline?: boolean,
	maxRows?: number,
	readOnly?: boolean,
	disabled?: boolean,
	disableUnderline?: boolean,
	errorHelper?: string,
	helper?: string,
	startComponent?: React.ReactNode,
	endComponent?: React.ReactNode,
	debounceMS?: number,
	processor?: (text: string) => string,
	validator?: (text: string) => boolean,
	filter?: (text: string) => boolean,
	onSubmit?: (text: string) => void,
	onChange?: (text: string) => void,
	onKeyUp?: (event: KeyboardEvent<HTMLDivElement>) => void,
	onKeyDown?: (event: KeyboardEvent<HTMLDivElement>) => void,
}

const ValidatedTextField = (props: ValidatedTextFieldInterface) => {
	let [text, setText] = useState(props.defaultValue || '')
	const [error, setError] = useState(false)
	const debounceRef = useRef<number>()

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		e.preventDefault()

		let value = e.target.value
		if (props.filter && value != '') value = props.filter(value) ? value : text
		text = props.processor?.(value) ?? value
		setText(text)
		props.onChange?.(value)

		if (debounceRef.current) clearTimeout(debounceRef.current)
		debounceRef.current = setTimeout(() => {
			const valid = props.validator ? props.validator(text) : true
			setError(!valid)
			props.onSubmit?.(valid ? text : '')
		}, props.debounceMS || DEFAULT_INPUT_FIELD_DEBOUNCE)
	}

	return (//@ts-ignore
		<TextFieldMUI
			sx={{ 
				...props.sx, 
				fontStyle: props.optional ? 'italic' : 'normal' 
			}}
			variant={props.variant}
			type={props.type || 'text'}
			size={props.size}
			value={props.value !== undefined ? props.value : text}
			id={props.label?.toLowerCase()}
			error={error}
			helperText={props.helper || error && (props.errorHelper || props.optional ? `${props.label} is required` : `${props.label} is invalid`)}
			label={props.label && `${props.label}${props.optional ? ' (Optional)' : ''}`}
			placeholder={props.placeholder}
			fullWidth={true}
			multiline={props.multiline}
			maxRows={props.maxRows}
			disabled={props.disabled}
			InputProps={{
				...(props.variant === 'standard' ? { disableUnderline: props.disableUnderline } : {}),
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
			onKeyDown={props.onKeyDown}
			onKeyUp={props.onKeyUp}
			onChange={handleChange}
		/>
	)
}

export default ValidatedTextField