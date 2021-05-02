import SublyApi from '../Api';
import { FETCH_PRODUCTS } from './types';
import { showErr } from './errors';

export function getProductsFromApi(token) {
	return async function(dispatch) {
		try {
			const products = await SublyApi.getProducts(token);
			dispatch(getProducts(products));
		} catch (err) {
			dispatch(showErr(err));
		}
	};
}

function getProducts(products) {
	return {
		type     : FETCH_PRODUCTS,
		products
	};
}
