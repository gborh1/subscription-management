import { SHOW_ERR, CLEAR_ERR } from '../actions/types';

export default function rootReducer(state = [], action) {
	switch (action.type) {
		case SHOW_ERR:
			return action.msg;
		case CLEAR_ERR:
			// const newErr = { ...state };
			// newErr.message && delete newErr.message;
			return [];

		default:
			return state;
	}
}
