import './Nav.css';
import NavGroup from './NavGroup';
import { NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

import React, { useEffect, useContext } from 'react';
import { Navbar } from 'reactstrap';

/** Nav bar for the App.  It changes depending on whether user is logged in */
function Nav() {
	/** Get Current user from redux instead of useContext */
	const currentUser = useSelector((st) => st.currentUser);

	// define links for when a user is signed in or out
	const signedInLinks = [ { name: 'Settings', path: 'settings' } ];

	// useEffect(
	// 	() => {
	// 		console.log('the nav mounted');
	// 	},
	// 	[ currentUser ]
	// );

	const signedOutLinks = [ { name: 'Login', path: 'login' }, { name: 'Sign Up', path: 'signup' } ];
	const links = currentUser
		? [ ...signedInLinks, { name: `Log out ${currentUser.username}`, path: 'logout' } ]
		: signedOutLinks;
	console.log('current user is:', currentUser);
	return (
		<div className="Nav">
			<Navbar expand="md" className="justify-content-between">
				<NavLink exact to="/" color="green" className="navbar-brand ms-3">
					Subly
				</NavLink>
				<NavGroup links={links} />
			</Navbar>
		</div>
	);
}

export default Nav;
