import { FETCH_CURRENT, REMOVE_CURRENT } from '../actions/types';

export default function rootReducer(state = null, action) {
	switch (action.type) {
		case FETCH_CURRENT:
			return action.user;
		case REMOVE_CURRENT:
			return null;
		default:
			return state;
	}
}
