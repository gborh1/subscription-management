import React, { useContext, useEffect } from 'react';
import { Link, useHistory } from 'react-router-dom';
import './PayPage.css';
import { useSelector, useDispatch } from 'react-redux';
import { Typography, Button } from '@material-ui/core';
import { changeToIsPaid } from './actions/currentUser';
import { clearErr } from './actions/errors';

/** component for default screen. It hows sign in buttons when user is signed out.  Shows a welcome message when user is logged in */
const PayPage = () => {
	const currentUser = useSelector((st) => st.currentUser);
	const token = useSelector((st) => st.token);
	const dispatch = useDispatch();

	useEffect(
		() => {
			console.log('we are in here');
			if (currentUser && currentUser.hasPaid) history.push('/profile');
		},
		[ currentUser ]
	);
	// sets error to null when the component first mounts and when it dismounts.
	useEffect(() => {
		return () => {
			console.log('dismount');
			dispatch(clearErr());
		};
	}, []);

	const history = useHistory();

	const userHasPaid = () => {
		dispatch(changeToIsPaid(currentUser.username, token));
	};

	const loginButtons = (
		<p>
			<Link to="/login">
				<button className="btn btn-info fw-bold me-3">Log in</button>
			</Link>
			<Link to="/signup">
				<button className="btn btn-info fw-bold">Sign up</button>
			</Link>
		</p>
	);

	return (
		<div className="pt-5">
			<div className="PayPage d-flex align-items-center ">
				<div className="container text-center">
					<Typography gutterBottom variant="h1">
						{' '}
						Payment Form
					</Typography>
					<Typography variant="h6" gutterBottom>
						On this page, we collect your fake credit card. Hit the button below to make a fake payment
					</Typography>
					<button onClick={userHasPaid} className="btn btn-primary fw-bold mt-4">
						Make a Fake Payment
					</button>
					{/* <Link to="/signup">
						<button className="btn btn-primary fw-bold mt-4">Make a Fake Payment</button>
					</Link> */}
				</div>
			</div>
		</div>
	);
};

export default PayPage;
