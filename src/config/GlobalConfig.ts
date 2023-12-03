import { EditorSettingsType } from "../types/general"

export const METRIC_PREFIXES = [
	{ exp: -18, symbol: 'a' },
	{ exp: -15, symbol: 'f' },
	{ exp: -12, symbol: 'p' },
	{ exp: -9, symbol: 'n' },
	{ exp: -6, symbol: 'µ' },
	{ exp: -3, symbol: 'm' },
	{ exp: -2, symbol: 'c' },
	{ exp: 0, symbol: '' },
	{ exp: 3, symbol: 'k' },
	{ exp: 6, symbol: 'M' },
	{ exp: 9, symbol: 'G' },
	{ exp: 12, symbol: 'T' },
	{ exp: 15, symbol: 'P' },
	{ exp: 18, symbol: 'E' },
];

export const EXPONENT_SUFFIXES: { [key: string]: number } = {
	'⁻': -1,
	'⁰': 0,
	'¹': 1,
	'²': 2,
	'³': 3,
	'⁴': 4,
	'⁵': 5,
	'⁶': 6,
	'⁷': 7,
	'⁸': 8,
	'⁹': 9,
}

export const DEFAULT_DECIMALS = 5
export const SNAP_DECIMALS = 1

export const MAX_UNDO_STATES = 1000

export const DEFAULT_EDITOR_SETTINGS: EditorSettingsType = {
	scale: 1,
	grid_enabled: true,
	debug: false,
}

export const DRAG_UPDATE_INTERVAL = 1000 / 60

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
			{
				keys: ['Ctrl', 'Z'],
				action: 'Undo'
			},
			{
				keys: ['Ctrl', 'Y'],
				action: 'Redo'
			},
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
				action: 'Add joint'
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
				keys: ['MiddleClick', 'Drag'],
				action: 'Pan'
			},
			{
				keys: ['ScrollUp'],
				action: 'Zoom in'
			},
			{
				keys: ['ScrollDown'],
				action: 'Zoom out'
			},
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
				keys: ['LeftClick', 'Drag'],
				action: 'Move selected joints and members'
			},
			{
				keys: ['Shift', 'LeftClick', 'Drag'],
				action: 'Move selected joints and members (Mirrored)'
			},
			{
				keys: ['Ctrl', 'Arrows'],
				action: 'Move selected joints and members (0.1m)'
			},
			{
				keys: ['Ctrl', 'Shift', 'Arrows'],
				action: 'Move selected joints and members (Mirrored, 0.1m)'
			},
			{
				keys: ['Ctrl', 'Alt', 'Arrows'],
				action: 'Precision move selected joints and members (0.01m) '
			},
			{
				keys: ['Ctrl', 'Shift', 'Alt', 'Arrows'],
				action: 'Precision move selected joints and members (Mirrored, 0.01m)'
			},
		]
	},
]