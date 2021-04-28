import React from 'react';
import { Nav, NavItem } from 'reactstrap';
import { NavLink } from 'react-router-dom';
import './NavGroup.css';
import { useSelector, useDispatch } from 'react-redux';
import { logout, deleteToken } from './actions/currentUser';

/** Component for a group of links. Takes in an array as a prop and creates navigation links with the given name */
function NavGroup({ links }) {
	const dispatch = useDispatch();
	const signOut = () => {
		dispatch(logout());
		dispatch(deleteToken());
	};

	return (
		<Nav className=" NavGroup ms-auto me-2 " navbar>
			{links.map((g, indx) => (
				<NavItem key={indx} className="mx-3">
					<NavLink onClick={signOut} to={`/${g.path}`}>
						{g.name}
					</NavLink>
				</NavItem>
			))}
		</Nav>
	);
}

export default NavGroup;
