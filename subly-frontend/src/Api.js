import axios from 'axios';

const BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:3001';

/** API Class.
 *
 * Static class tying together methods used to get/send to to the API.
 * There shouldn't be any frontend-specific stuff here, and there shouldn't
 * be any API-aware stuff elsewhere in the frontend.
 *
 */

class SublyApi {
	// the token for interactive with the API will be stored here.
	static token;

	static async request(endpoint, data = {}, method = 'get', header) {
		console.debug('API Call:', endpoint, data, method);

		const url = `${BASE_URL}/${endpoint}`;
		const headers = header || { Authorization: `Bearer ${SublyApi.token}` };
		const params = method === 'get' ? data : {};

		try {
			return (await axios({ url, method, data, params, headers })).data;
		} catch (err) {
			console.error('API Error:', err.response);
			let message = err.response.data.error.message;
			throw Array.isArray(message) ? message : [ message ];
		}
	}

	// Individual API routes

	/** sign user up and get token  */
	static async userSignup(data) {
		let res = await this.request(`auth/userRegister`, data, 'post');
		return res.token;
	}

	/** sign admin up and get token  */
	static async adminSignup(data) {
		let res = await this.request(`auth/adminRegister`, data, 'post');
		return res.token;
	}

	/** log user in and get token  */
	static async userLogin(data) {
		let res = await this.request(`auth/userToken`, data, 'post');
		return res.token;
	}

	/** log admin in and get token  */
	static async adminLogin(data) {
		let res = await this.request(`auth/adminToken`, data, 'post');
		return res.token;
	}

	/** Get a list of all users, accounting for filtering data  */
	static async getUsers(token) {
		const header = { Authorization: `Bearer ${token}` };
		let res = await this.request(`users`, undefined, undefined, header);
		return res.users;
	}

	/** Get a list of all products, accounting for filtering data  */
	static async getProducts(token, data = {}) {
		const header = { Authorization: `Bearer ${token}` };
		let res = await this.request(`products`, data, undefined, header);
		return res.products;
	}

	/** get a particular user using username.  Account for need for token in the header */
	static async getUser(username, token) {
		const header = { Authorization: `Bearer ${token}` };
		let res = await this.request(`users/${username}`, undefined, undefined, header);
		return { user: res.user, token: res.token };
	}

	/** updates user using username in the param. Account for token in the header*/
	static async updateUser(username, data, token) {
		const header = { Authorization: `Bearer ${token}` };
		let res = await this.request(`users/${username}`, data, 'patch', header);
		return res.user;
	}

	/** Applies to product given username and product id params */
	static async subscribeToProduct(username, productId, token) {
		console.log('we are attempting to subscribe');
		const header = { Authorization: `Bearer ${token}` };
		let res = await this.request(`users/${username}/products/${productId}`, undefined, 'post', header);
		return res.subcribed;
	}

	/** Applies to product given username and product id params */
	static async unsubscribeFromProduct(username, productId, token) {
		console.log('we are attempting to unsubscribe');
		const header = { Authorization: `Bearer ${token}` };
		let res = await this.request(`users/${username}/products/${productId}`, undefined, 'delete', header);
		return res.unsubcribed;
	}
}

// for now, put token ("testuser" / "password" on class)
SublyApi.token =
	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZ' +
	'SI6InRlc3R1c2VyIiwiaXNBZG1pbiI6ZmFsc2UsImlhdCI6MTU5ODE1OTI1OX0.' +
	'FtrMwBQwe6Ue-glIFgz_Nf8XxRT2YecFCiSpYL0fCXc';

export default SublyApi;
