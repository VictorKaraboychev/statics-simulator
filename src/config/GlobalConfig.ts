import { GridScaleType } from "../types/general"

export const DEFAULT_PRECISION = 5

export const MAX_UNDO_STATES = 10000

export const DEFAULT_GRID_SCALE: GridScaleType = {
	scale: 1,
	base_unit: 'm'
}

export const TRUSS_SCALE = 20
export const HOVER_PRECISION = 0.1

export const THEME_OPTIONS = {
	system: 'System Default',
	light: 'Light',
	dark: 'Dark'
}

export const VIEW_MODES = [
	'default',
	'stress',
]

export const KEY_BINDINGS = [
	{
		category: 'General',
		bindings: [
			{
				keys: ['Alt', 'N'],
				action: 'New'
			},
			{
				keys: ['Ctrl', 'S'],
				action: 'Save'
			},
			{
				keys: ['Ctrl', 'O'],
				action: 'Open'
			},
			// {
			// 	keys: ['Ctrl', 'Z'],
			// 	action: 'Undo'
			// },
			// {
			// 	keys: ['Ctrl', 'Y'],
			// 	action: 'Redo'
			// },
			{
				keys: ['LeftClick'],
				action: 'Select'
			},
			{
				keys: ['Ctrl', 'LeftClick'],
				action: 'Multi-select'
			}
		]
	},
	{
		category: 'Edit',
		bindings: [
			{
				keys: ['Ctrl', 'A'],
				action: 'Select all'
			},
			{
				keys: ['Ctrl', 'D'],
				action: 'Deselect all'
			},
			{
				keys: ['Shift', 'Delete'],
				action: 'Delete selected joints and members'
			},
			{
				keys: ['Ctrl', 'Q'],
				action: 'Set Optimal Multipliers'
			},
			{
				keys: ['Shift', 'LeftClick'],
				action: 'Add joint (Un-Mirrored)'
			},
			{
				keys: ['Shift', 'Alt', 'LeftClick'],
				action: 'Add joint (Mirrored)'
			},
		]
	},
	{
		category: 'View',
		bindings: [
			{
				keys: ['Ctrl', 'F'],
				action: 'Toggle Force Overlay'
			},
			{
				keys: ['Ctrl', 'M'],
				action: 'Cycle Truss View'
			}
		]
	},
	{
		category: 'Movement',
		bindings: [
			{
				keys: ['Ctrl', 'Arrows'],
				action: 'Move selected joints and members (Mirrored, 0.1m)'
			},
			{
				keys: ['Ctrl', 'Shift', 'Arrows'],
				action: 'Move selected joints and members (Un-Mirrored, 0.1m)'
			},
			{
				keys: ['Ctrl', 'Alt', 'Arrows'],
				action: 'Precision move selected joints and members (Mirrored, 0.01m) '
			},
			{
				keys: ['Ctrl', 'Shift', 'Alt', 'Arrows'],
				action: 'Precision move selected joints and members (Un-Mirrored, 0.01m)'
			},
		]
	},
]