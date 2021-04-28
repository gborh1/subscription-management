import React, { useState, useContext, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { userSignup } from './actions/currentUser';
import { useHistory } from 'react-router-dom';
import { clearErr } from './actions/errors';

// import JoblyContext from './JoblyContext';

/** Form for adding new items to to the db.  For allow suser to pick the kind of item before inputting information */
const SignupForm = () => {
	// const { signup, setLoginLoading, error, token, setError } = useContext(JoblyContext);
	const dispatch = useDispatch();
	const history = useHistory();
	const error = useSelector((st) => st.errors);
	const currentUser = useSelector((st) => st.currentUser);

	useEffect(
		() => {
			if (currentUser) history.push('/');
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

	const INITIAL_STATE = {
		username  : '',
		password  : '',
		firstName : '',
		lastName  : '',
		email     : ''
	};

	// sets state for form data
	const [ formData, setFormData ] = useState(INITIAL_STATE);

	// handles the change in the form. react sets form data in state every time there is a change.
	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((formData) => ({ ...formData, [name]: value }));
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		// setLoginLoading(() => true);
		dispatch(userSignup(formData));
	};

	return (
		<div className="pt-5">
			<div className="SignupForm">
				<div className="container col-md-6 offset-md-3 col-lg-4 offset-lg-4 ">
					<h2 className="mb-3">Sign Up</h2>
					<div className="card">
						<div className="card-body">
							<form onSubmit={handleSubmit}>
								<div class="mb-3">
									<label htmlFor="username" class="form-label">
										Username
									</label>
									<input
										type="text"
										className="form-control"
										id="username"
										name="username"
										value={formData.username}
										onChange={handleChange}
									/>
								</div>

								<div class="mb-3">
									<label htmlFor="password" class="form-label">
										Password
									</label>
									<input
										type="text"
										className="form-control"
										id="password"
										name="password"
										value={formData.password}
										onChange={handleChange}
									/>
								</div>
								<div class="mb-3">
									<label htmlFor="firstName" class="form-label">
										First name
									</label>
									<input
										type="text"
										className="form-control"
										id="firstName"
										name="firstName"
										value={formData.firstName}
										onChange={handleChange}
									/>
								</div>
								<div class="mb-3">
									<label htmlFor="lastName" class="form-label">
										Last name
									</label>
									<input
										type="text"
										className="form-control"
										id="lastName"
										name="lastName"
										value={formData.lastName}
										onChange={handleChange}
									/>
								</div>
								<div class="mb-3">
									<label htmlFor="email" class="form-label">
										Email address
									</label>
									<input
										type="email"
										className="form-control"
										id="email"
										name="email"
										value={formData.email}
										onChange={handleChange}
										aria-describedby="emailHelp"
									/>
									<div id="emailHelp" class="form-text">
										We'll never share your email with anyone else.
									</div>
								</div>
								<div className="text-danger mb-3 ">
									{error ? (
										error.map((e, indx) => (
											<div key={indx}>
												<small>ERROR: {e}</small>
											</div>
										))
									) : null}
								</div>
								<button type="submit" className="btn btn-primary float-end">
									Submit
								</button>
							</form>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default SignupForm;
