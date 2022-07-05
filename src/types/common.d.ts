import { SvgIconTypeMap, SxProps, Theme } from '@mui/material'
import { OverridableComponent } from '@mui/material/OverridableComponent'
import { ReactNode } from 'react'

export type MultiStepFormComponentInterface<T> = {
	data?: T
	onComplete: (data: T) => void
	onFailure: (error: string) => void
}

export type CategorizedValueType = { 
	category?: string, 
	value: string 
}

export type DropSelectOption = { 
	category?: string, 
	options: string[] 
}

export type IconButtonType = {
	label: string
	icon?: OverridableComponent<SvgIconTypeMap<{}, 'svg'>>
	disabled?: boolean
	onClick?: () => void
}

export type TextButtonType = {
	label: React.ReactNode
	loading?: boolean
	disabled?: boolean
	color?: 'inherit' | 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning'
	variant?: 'text' | 'outlined' | 'contained'
	onClick?: () => void
}

export type ImageType = {
	blob: Blob,
	url: string
}

export type MenuOptionType = {
	sx?: SxProps<Theme>
	label: ReactNode
	variant?: 'button' | 'caption' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'inherit' | 'overline' | 'subtitle1' | 'subtitle2' | 'body1' | 'body2'
	icon?: OverridableComponent<SvgIconTypeMap<{}, 'svg'>>
	disabled?: boolean
	color?: string
	divider?: boolean
	onClick?: () => void
}

export type TimelineOptionType = {
	sx?: SxProps<Theme>
	label: string
	oppositeLabel?: string
	icon?: OverridableComponent<SvgIconTypeMap<{}, 'svg'>>
	color?: string
	onClick?: () => void
}

export type AdvancedTypographyType = {
	sx?: SxProps<Theme>
	variant?: 'button' | 'caption' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'inherit' | 'overline' | 'subtitle1' | 'subtitle2' | 'body1' | 'body2'
	text: ReactNode | ReactNode[],
}

export type NotificationOptionType = { 
	getTitle: (count?: number) => string
	color: string
	Icon: OverridableComponent<SvgIconTypeMap<{}, "svg">>
}