import React, { useContext, useEffect } from 'react';
import { Link, useHistory } from 'react-router-dom';
import './Home.css';
import { useSelector, useDispatch } from 'react-redux';

/** component for default screen. It hows sign in buttons when user is signed out.  Shows a welcome message when user is logged in */
const Home = ({ logout }) => {
	const currentUser = useSelector((st) => st.currentUser);

	const history = useHistory();

	// useEffect(() => {
	// 	if (logout) {
	// 		logout();
	// 		history.push('/');
	// 	}
	// });

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
			<div className="Home  d-flex align-items-center ">
				<div className="container text-center">
					<h1 className="mb-4 fw-bold">Subly</h1>
					<p>Subscribe to multiple micro services</p>

					{currentUser ? <h2>Welcome Back, {currentUser.firstName}</h2> : loginButtons}
				</div>
			</div>
		</div>
	);
};

export default Home;
