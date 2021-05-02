import React, { useContext } from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import Home from './Home';

import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import Profile from './Profile';
import PayPage from './PayPage';
import { useSelector } from 'react-redux';

/** Components for displaying routes. Here authetication is checked.  */
function Routes() {
	const currentUser = useSelector((st) => st.currentUser);
	return (
		<Switch>
			<Route exact path="/login">
				<LoginForm />
			</Route>
			<Route exact path="/signup">
				<SignupForm />
			</Route>
			<Route exact path="/pay">
				{currentUser ? <PayPage /> : <Redirect to="/" />}
			</Route>
			<Route exact path="/profile">
				{currentUser && currentUser.hasPaid ? <Profile /> : <Redirect to="/" />}
			</Route>
			<Route exact path="/">
				<Home />
			</Route>
			<Route exact path="/logout">
				<Redirect to="/" />
			</Route>
			<Redirect to="/" />
		</Switch>
	);
}

export default Routes;
