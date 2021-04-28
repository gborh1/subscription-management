import { FETCH_USERS } from '../actions/types';

export default function rootReducer(state = {}, action) {
	switch (action.type) {
		case FETCH_USERS:
			return { ...state, [action.user.id]: action.user };
		default:
			return state;
	}
}
