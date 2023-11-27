import React, { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css' //@ts-ignore
import FPSStats from "react-fps-stats"
import { RecoilRoot } from 'recoil'
import { SnackbarProvider } from 'notistack'
import Router from './components/routes/Router'

ReactDOM.createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<RecoilRoot>
			<SnackbarProvider
				maxSnack={3}
			>
				{/* <FPSStats /> */}
				<Router />
			</SnackbarProvider>
		</RecoilRoot>
	</StrictMode>
)
