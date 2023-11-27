import { ReactElement, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
// import { useAuth } from '../../firebase/auth'

interface AuthGuardInterface {
	value: any,
	children: ReactElement
}

const AuthGuard = (props: AuthGuardInterface): ReactElement | null => {
	// const { USER, getAuthLevel } = useAuth()
	const location = useLocation()
	const navigate = useNavigate()

	const [allowed, setAllowed] = useState(false)

	useEffect(() => {
		if (!allowed) {
			const authLevel = 4;//getAuthLevel();
			[
				() => { },
				() => navigate('/login', { state: { from: location } }),
				() => navigate('/signup/verify-email', { replace: true }),
				() => navigate('/signup/setup-account', { replace: true }),
				() => setAllowed(true)
			][authLevel]()
		}
	}, [])

	return (allowed || props.value) ? props.children : null
}

export default AuthGuard