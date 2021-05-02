import SublyApi from '../Api';

import { FETCH_CURRENT, REMOVE_CURRENT, FETCH_TOKEN, REMOVE_TOKEN } from './types';
import { showErr, clearErr } from './errors';

export function userLogin(data) {
	return async function(dispatch) {
		try {
			dispatch(clearErr());
			const token = await SublyApi.userLogin(data);
			const { user } = await SublyApi.getUser(data.username, token);
			dispatch(getUser(user));
			dispatch(getToken(token));
		} catch (err) {
			dispatch(showErr(err));
		}
	};
}

export function userSignup(data) {
	return async function(dispatch) {
		try {
			dispatch(clearErr());
			const token = await SublyApi.userSignup(data);
			const { user } = await SublyApi.getUser(data.username, token);
			dispatch(getUser(user));
			dispatch(getToken(token));
		} catch (err) {
			dispatch(showErr(err));
		}
	};
}
export function subscribeToProduct(username, productId, token) {
	return async function(dispatch) {
		try {
			dispatch(clearErr());
			console.log('we are gettig in here');
			const message = await SublyApi.subscribeToProduct(username, productId, token);
			console.log('we got here', message);
			const { user } = await SublyApi.getUser(username, token);
			dispatch(getUser(user));
		} catch (err) {
			dispatch(showErr(err));
		}
	};
}
export function unsubscribeFromProduct(username, productId, token) {
	return async function(dispatch) {
		try {
			dispatch(clearErr());
			console.log('we are gettig in here');
			const message = await SublyApi.unsubscribeFromProduct(username, productId, token);
			console.log('we got here', message);
			const { user } = await SublyApi.getUser(username, token);
			dispatch(getUser(user));
		} catch (err) {
			dispatch(showErr(err));
		}
	};
}

export function changeToIsPaid(username, oldToken) {
	return async function(dispatch) {
		try {
			dispatch(clearErr());

			console.log('we are in is paid');
			const user = await SublyApi.updateUser(username, { hasPaid: true }, oldToken);
			console.log(user);
			const { token } = await SublyApi.getUser(username, oldToken);
			console.log(user);
			dispatch(getUser(user));
			dispatch(getToken(token));
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
