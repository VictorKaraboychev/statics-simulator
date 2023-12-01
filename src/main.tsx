import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import './index.css' //@ts-ignore
import { RecoilRoot } from 'recoil'
import { SnackbarProvider } from 'notistack'
import Router from './components/routes/Router'

ReactDOM.createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<RecoilRoot>
			<SnackbarProvider
				maxSnack={3}
			>
				<Router />
			</SnackbarProvider>
		</RecoilRoot>
	</StrictMode>
)
