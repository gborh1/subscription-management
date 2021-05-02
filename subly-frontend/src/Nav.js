import './Nav.css';
import NavGroup from './NavGroup';
import { NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Typography } from '@material-ui/core';
import 'fontsource-roboto';

import React, { useEffect, useContext } from 'react';
import { Navbar } from 'reactstrap';

import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
	theme1 : {
		color : 'dodgerblue'
	},
	theme2 : {
		color : 'PaleVioletRed'
	}
});

/** Nav bar for the App.  It changes depending on whether user is logged in */
function Nav() {
	const classes = useStyles();
	/** Get Current user from redux instead of useContext */
	const currentUser = useSelector((st) => st.currentUser);

	// define links for when a user is signed in or out
	const signedInLinks = [];

	const signedOutLinks = [ { name: 'Login', path: 'login' }, { name: 'Sign Up', path: 'signup' } ];
	const links = currentUser
		? [ ...signedInLinks, { name: `Logout ${currentUser.username}`, path: 'logout', logout: true } ]
		: signedOutLinks;
	console.log('current user is:', currentUser);
	return (
		<div className="Nav">
			<Navbar expand="md" className="justify-content-between">
				<NavLink exact to="/" color="green" className="navbar-brand ms-3">
					<Typography className={classes.theme2} variant="h4">
						Subly
					</Typography>
				</NavLink>
				<NavGroup links={links} />
			</Navbar>
		</div>
	);
}

export default Nav;
