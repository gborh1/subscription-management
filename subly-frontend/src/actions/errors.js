import { SHOW_ERR, CLEAR_ERR } from './types';

/** actions for toggling error message */
export function showErr(msg) {
	return { type: SHOW_ERR, msg };
}
export function clearErr() {
	return { type: CLEAR_ERR };
}
