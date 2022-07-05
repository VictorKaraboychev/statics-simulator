import React, { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css' //@ts-ignore
import FPSStats from "react-fps-stats"
import { RecoilRoot } from 'recoil'

ReactDOM.createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<RecoilRoot>
			<App />
			<FPSStats />
		</RecoilRoot>
	</StrictMode>
)
