import { SHOW_ERR, CLEAR_ERR } from '../actions/types';

const INITIAL_STATE = null;
const errors = (state = INITIAL_STATE, action) => {
	switch (action.type) {
		case SHOW_ERR:
			return action.msg;
		case CLEAR_ERR:
			// const newErr = { ...state };
			// newErr.message && delete newErr.message;
			return null;

		default:
			return state;
	}
};

export default errors;
