import React, { useState, useContext, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { userLogin } from './actions/currentUser';
import { useHistory } from 'react-router-dom';
import { clearErr } from './actions/errors';

/** Form for adding new items to to the db.  For allow suser to pick the kind of item before inputting information */
const LoginForm = () => {
	// const { login, setLoginLoading, error, setError } = useContext(JoblyContext);
	const dispatch = useDispatch();
	const history = useHistory();
	const error = useSelector((st) => st.errors);
	const currentUser = useSelector((st) => st.currentUser);

	console.log(error);

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
		username : '',
		password : ''
	};

	// sets state for form data and the kind of menu, which can be toggled.
	const [ formData, setFormData ] = useState(INITIAL_STATE);

	// handles the change in the form. react sets form data in state every time there is a change.
	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((formData) => ({ ...formData, [name]: value }));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		// setLoginLoading(true);
		await dispatch(userLogin(formData));
		console.log('we actually did it');
	};

	return (
		<div className="pt-5">
			<div className="LoginForm">
				<div className="container col-md-6 offset-md-3 col-lg-4 offset-lg-4 ">
					<h2 className="mb-3">Log In</h2>
					<div className="card">
						<div className="card-body">
							<form onSubmit={handleSubmit}>
								<div className="mb-3">
									<label htmlFor="username" className="form-label">
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
								<div className="mb-3">
									<label htmlFor="password" className="form-label">
										Password
									</label>
									<input
										type="password"
										className="form-control"
										id="password"
										name="password"
										value={formData.password}
										onChange={handleChange}
									/>
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

export default LoginForm;
