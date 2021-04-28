import axios from 'axios';
import SublyApi from '../Api';

import { FETCH_USER } from './types';

export function getUserFromAPI(username, token) {
	return async function(dispatch) {
		try {
			const response = await SublyApi.getUser(username, token);
			return dispatch(getUser(response.data));
		} catch (err) {
			dispatch(showErr(err.response.data));
		}
	};
}

function getUser(user) {
	return {
		type : FETCH_POST,
		user
	};
}
