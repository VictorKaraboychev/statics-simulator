import { RouteType, RouteWrapperType } from '../types/general'
import AuthGuard from '../components/routes/AuthGuard'
// import PermissionGuard from '../components/routes/PermissionGuard'

export const GUARD_MAP: RouteWrapperType = [
	{
		property: 'private',
		guard: AuthGuard
	},
	{
		property: 'permissions',
		guard: () => null
	}
]

const ROUTES: RouteType = {
	component: import('../App'),
	'': {
		index: true,
		component: import('../components/pages/home/Home'),
	},
	'*': {
		component: import('../components/misc/Page404'),
	}
}

export default ROUTES