import { SxProps, Theme } from '@mui/material'
import React from 'react'
import { Range } from '../../../types/general'
import { countDecimals, isWithin, constrain } from '../../../utility/math'
import { isNum } from '../../../utility/validators'
import ValidatedTextField from './ValidatedTextField'

interface NumberFieldInterface {
	sx?: SxProps<Theme>, 
	label?: string,
	size?: 'small' | 'medium',
	defaultValue?: number,
	placeholder?: string,
	errorHelper?: string,
	helper?: string,
	decimals?: number,
	range?: Range,
	startComponent?: React.ReactNode,
	endComponent?: React.ReactNode,
	onSubmit?: (value: number) => void
}

const NumberField = (props: NumberFieldInterface) => {
	const processor = (text: string): string => {
		if (!isNum(text)) return text
		let value = Number(text)

		if (props.range) value = constrain(value, props.range)

		if (props.decimals !== undefined && countDecimals(value) > props.decimals) {
			return Number(text).toFixed(props.decimals)
		} else {
			return value.toString()
		}
	}

	const validator = (text: string) => {
		return isNum(text) && (!props.range || isWithin(Number(text), props.range))
	}

	const handleSubmit = (text: string) => {
		props.onSubmit?.(Number(text))
	}

	return (
		<ValidatedTextField
			sx={props.sx}
			type={'text'}
			label={props.label}
			size={props.size}
			helper={props.helper}
			errorHelper={props.errorHelper}
			defaultValue={props.defaultValue?.toString()}
			placeholder={props.placeholder}
			startComponent={props.startComponent}
			endComponent={props.endComponent}
			processor={processor}
			// filter={(value) => /\d/g.test(value)}
			validator={validator}
			onSubmit={handleSubmit}
		/>
	)
}

export default NumberField