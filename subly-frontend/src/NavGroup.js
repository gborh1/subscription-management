import React from 'react';
import { Nav, NavItem } from 'reactstrap';
import { NavLink } from 'react-router-dom';
import './NavGroup.css';
import { useSelector, useDispatch } from 'react-redux';
import { logout, deleteToken } from './actions/currentUser';
import { Typography } from '@material-ui/core';

import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
	theme1 : {
		color : 'dodgerblue'
	},
	theme2 : {
		color : 'PaleVioletRed'
	}
});

/** Component for a group of links. Takes in an array as a prop and creates navigation links with the given name */
function NavGroup({ links }) {
	const classes = useStyles();
	const dispatch = useDispatch();
	const signOut = () => {
		dispatch(logout());
		dispatch(deleteToken());
	};

	return (
		<Nav className=" NavGroup ms-auto me-2 " navbar>
			{links.map((link, indx) => (
				<NavItem key={indx} className="mx-3">
					<NavLink className="text-decoration-none" onClick={link.logout && signOut} to={`/${link.path}`}>
						<Typography className={classes.theme1} variant="h5">
							{link.name}
						</Typography>
					</NavLink>
				</NavItem>
			))}
		</Nav>
	);
}

export default NavGroup;
