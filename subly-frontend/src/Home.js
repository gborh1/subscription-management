import React, { useContext, useEffect } from 'react';
import { Link, useHistory } from 'react-router-dom';
import './Home.css';
import { useSelector, useDispatch } from 'react-redux';

import { makeStyles } from '@material-ui/core/styles';
import { Typography, Button } from '@material-ui/core';
import 'fontsource-roboto';

const useStyles = makeStyles({
	theme1 : {
		color : 'dodgerblue'
	},
	theme2 : {
		color : 'PaleVioletRed'
	},
	theme3 : {
		color           : 'white',
		backgroundColor : 'dodgerblue',
		'&:hover'       : {
			backgroundColor : 'PaleVioletRed',
			color           : 'white'
		}
	}
});

/** component for default screen. It shows sign in buttons when user is signed out.  Shows a welcome message when user is logged in */
const Home = () => {
	const classes = useStyles();
	const currentUser = useSelector((st) => st.currentUser);

	const history = useHistory();

	const loginButtons = (
		<Link to="/login" className="text-decoration-none">
			<button variant="contained" className={`btn ${classes.theme3}`}>
				<Typography variant="h4">Give it a shot!</Typography>
			</button>
		</Link>
	);

	return (
		<div className="pt-5">
			<div className="Home  d-flex align-items-center ">
				<div className="container text-center">
					<Typography variant="h1" className="mb-4">
						Welcome to Subly!
					</Typography>
					<Typography variant="h5" className="mb-4">
						Subscribe to multiple micro services
					</Typography>

					{currentUser ? <h2>Welcome Back, {currentUser.firstName}</h2> : loginButtons}
				</div>
			</div>
		</div>
	);
};

export default Home;
