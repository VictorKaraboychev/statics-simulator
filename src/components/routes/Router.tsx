import { ReactElement, ReactNode, Suspense, lazy } from 'react'
import { BrowserRouter, Outlet, Route, Routes } from 'react-router-dom'
import ROUTES, { GUARD_MAP } from '../../config/RouteConfig'
import { RouteType } from '../../types/general'
import ScrollToTop from './ScrollTop'
import { ErrorBoundary } from 'react-error-boundary'
import ErrorFallback from '../misc/ErrorFallback'
import Loading from '../common/Loading'

const getElement = (obj: RouteType): ReactNode => {
	const RouteComponent = obj.component ? lazy(() => obj.component!) : Outlet

	let element = <RouteComponent />
	for (let i = GUARD_MAP.length - 1; i >= 0; i--) {
		if (obj[GUARD_MAP[i].property]) {
			const Wrapper = GUARD_MAP[i].guard
			element = <Wrapper value={obj[GUARD_MAP[i].property]}>{element}</Wrapper>
		}
	}
	return (
		<ErrorBoundary
			FallbackComponent={ErrorFallback}
			onReset={() => {
				sessionStorage.clear()
				localStorage.clear()
			}}
			onError={(_error: Error) => { // TODO: Send error to server

			}}
		>
			<Suspense
				fallback={<Loading />}
			>
				{element}
			</Suspense>
		</ErrorBoundary>
	)
}

const Router = () => {
	const nestedRoutes = (obj: RouteType, path = '/', id = 0) => {
		return obj.index ? (
			<Route
				key={id}
				index={true}
				element={getElement(obj)}
			/>
		) : (
			<Route
				key={id}
				path={path}
				element={getElement(obj)}
			>
				{Object.keys(obj).reduce((acc, key, i) => {//@ts-ignore
					if (key !== 'component' && key !== 'index' && GUARD_MAP.findIndex(({ property }) => property === key) === -1) acc.push(nestedRoutes(obj[key], key, i))
					return acc
				}, [] as ReactElement[])}
			</Route>
		)
	}

	return (
		<BrowserRouter>
			<ScrollToTop />
			<Routes>{nestedRoutes(ROUTES)}</Routes>
		</BrowserRouter>
	)
}

export default Router