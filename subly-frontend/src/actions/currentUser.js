import SublyApi from '../Api';
import { useHistory } from 'react-router-dom';
import { FETCH_CURRENT, REMOVE_CURRENT, FETCH_TOKEN, REMOVE_TOKEN } from './types';
import { showErr } from './errors';

export function userLogin(data) {
	return async function(dispatch) {
		try {
			const token = await SublyApi.userLogin(data);
			const user = await SublyApi.getUser(data.username, token);
			dispatch(getUser(user));
		} catch (err) {
			dispatch(showErr(err));
		}
	};
}

export function userSignup(data) {
	return async function(dispatch) {
		try {
			const token = await SublyApi.userSignup(data);
			const user = await SublyApi.getUser(data.username, token);
			dispatch(getUser(user));
		} catch (err) {
			dispatch(showErr(err));
		}
	};
}

function getUser(user) {
	return {
		type : FETCH_CURRENT,
		user
	};
}

function getToken(token) {
	return {
		type  : FETCH_TOKEN,
		token
	};
}
export function deleteToken(token) {
	return {
		type  : REMOVE_TOKEN,
		token
	};
}

export function logout() {
	return {
		type : REMOVE_CURRENT
	};
}
