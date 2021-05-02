import { FETCH_TOKEN, REMOVE_TOKEN } from '../actions/types';

export default function token(state = null, action) {
	switch (action.type) {
		case FETCH_TOKEN:
			return action.token;
		case REMOVE_TOKEN:
			return null;
		default:
			return state;
	}
}
