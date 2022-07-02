import React, { ReactNode, useEffect } from 'react'
import { Box, SxProps, Theme, useTheme } from '@mui/material'
import { Accept, useDropzone } from 'react-dropzone'
import { HoverState } from '../../types/general'

export type DropRef = {
	current?: { open: () => void}
}

interface DropProps {
	sx?: SxProps<Theme>,
	reference?: DropRef,
	types?: Accept,
	noClick?: boolean,
	noDrag?: boolean,
	noKeyboard?: boolean,
	multiple?: boolean,
	hideBorder?: boolean,
	children?: ReactNode | ReactNode[],
	onSubmit?: (dropped: File[]) => void
	onHover?: (state: { state: HoverState, color: string }) => void
}

const Drop = (props: DropProps) => {
	const { palette } = useTheme()
	const { open, getRootProps, getInputProps, isFocused, isDragAccept, isDragReject, isDragActive } = useDropzone({
		accept: props.types,
		noClick: props.noClick,
		noDrag: props.noDrag,
		noKeyboard: props.noKeyboard,
		multiple: props.multiple,
		onDropAccepted: props.onSubmit,
	})

	const color = isDragAccept ? palette.success.main : isDragReject ? palette.error.main : palette.primary.main

	useEffect(() => {
		if (props.onHover) {
			if (isDragAccept) props.onHover({ state: 'accepted', color })
			else if (isDragReject) props.onHover({ state: 'rejected', color })
			else props.onHover({ state: 'none', color })
		}
	}, [isDragActive])

	if (props.reference) {
		props.reference.current = {
			open
		}
	}

	return (
		<div 
			{...getRootProps()} 
			style={{ 
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				width: '100%',
				height: '100%',
			}}
		>
			<input 
				{...getInputProps()} 
			/>
			<Box
				component={'div'}
				sx={{
					position: 'relative',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					borderWidth: props.hideBorder ? 0 : 2,
					borderStyle: 'dashed',
					borderColor: color,
					transition: 'border .24s ease-in-out',
					...props.sx,
				}}
			>
				{props.children}
			</Box>
		</div>
	)
}

export default Drop