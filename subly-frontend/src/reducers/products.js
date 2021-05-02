import { FETCH_PRODUCTS } from '../actions/types';

export default function products(state = [], action) {
	switch (action.type) {
		case FETCH_PRODUCTS:
			return action.products;
		default:
			return state;
	}
}
