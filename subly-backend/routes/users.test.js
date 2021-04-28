'use strict';

const request = require('supertest');

const db = require('../db.js');
const app = require('../app');
const User = require('../models/user');

const {
	commonBeforeAll,
	commonBeforeEach,
	commonAfterEach,
	commonAfterAll,
	testProductIds,
	u1Token,
	u2Token,
	u3Token,
	A1Token,
	A2Token
} = require('./_testCommon');

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /users */

describe('POST /users', function() {
	test('works for Approved admins: create non-admin', async function() {
		const resp = await request(app)
			.post('/users')
			.send({
				username  : 'u-new',
				firstName : 'First-new',
				lastName  : 'Last-newL',
				password  : 'password-new',
				email     : 'new@email.com',
				hasPaid   : false
			})
			.set('authorization', `Bearer ${A2Token}`);
		expect(resp.statusCode).toEqual(201);
		expect(resp.body).toEqual({
			user  : {
				username  : 'u-new',
				firstName : 'First-new',
				lastName  : 'Last-newL',
				email     : 'new@email.com',
				hasPaid   : false
			},
			token : expect.any(String)
		});
	});

	test('unauth for users', async function() {
		const resp = await request(app)
			.post('/users')
			.send({
				username  : 'u-new',
				firstName : 'First-new',
				lastName  : 'Last-newL',
				password  : 'password-new',
				email     : 'new@email.com',
				hasPaid   : false
			})
			.set('authorization', `Bearer ${u1Token}`);
		expect(resp.statusCode).toEqual(401);
	});
	test('unauth for reg admins', async function() {
		const resp = await request(app)
			.post('/users')
			.send({
				username  : 'u-new',
				firstName : 'First-new',
				lastName  : 'Last-newL',
				password  : 'password-new',
				email     : 'new@email.com',
				hasPaid   : false
			})
			.set('authorization', `Bearer ${A1Token}`);
		expect(resp.statusCode).toEqual(401);
	});

	test('unauth for anon', async function() {
		const resp = await request(app).post('/users').send({
			username  : 'u-new',
			firstName : 'First-new',
			lastName  : 'Last-newL',
			password  : 'password-new',
			email     : 'new@email.com',
			hasPaid   : false
		});
		expect(resp.statusCode).toEqual(401);
	});

	test('bad request if missing data', async function() {
		const resp = await request(app)
			.post('/users')
			.send({
				username : 'u-new'
			})
			.set('authorization', `Bearer ${A2Token}`);
		expect(resp.statusCode).toEqual(400);
	});

	test('bad request if invalid data', async function() {
		const resp = await request(app)
			.post('/users')
			.send({
				username  : 'u-new',
				firstName : 'First-new',
				lastName  : 'Last-newL',
				password  : 'password-new',
				email     : 'not-an-email',
				hasPad    : true
			})
			.set('authorization', `Bearer ${A2Token}`);
		expect(resp.statusCode).toEqual(400);
	});
});

// /************************************** GET /users */

describe('GET /users', function() {
	test('works for approved admins', async function() {
		const resp = await request(app).get('/users').set('authorization', `Bearer ${A2Token}`);
		expect(resp.body).toEqual({
			users : [
				{
					username  : 'u1',
					firstName : 'U1F',
					lastName  : 'U1L',
					email     : 'user1@user.com',
					hasPaid   : true,
					imageUrl  : null
				},
				{
					username  : 'u2',
					firstName : 'U2F',
					lastName  : 'U2L',
					email     : 'user2@user.com',
					hasPaid   : false,
					imageUrl  : null
				},
				{
					username  : 'u3',
					firstName : 'U3F',
					lastName  : 'U3L',
					email     : 'user3@user.com',
					hasPaid   : false,
					imageUrl  : null
				}
			]
		});
	});

	test('unauth for non-admin users', async function() {
		const resp = await request(app).get('/users').set('authorization', `Bearer ${u1Token}`);
		expect(resp.statusCode).toEqual(401);
	});

	test('unauth for unapproved admins', async function() {
		const resp = await request(app).get('/users').set('authorization', `Bearer ${A1Token}`);
		expect(resp.statusCode).toEqual(401);
	});

	test('unauth for anon', async function() {
		const resp = await request(app).get('/users');
		expect(resp.statusCode).toEqual(401);
	});

	test('fails: test next() handler', async function() {
		// there's no normal failure event which will cause this route to fail ---
		// thus making it hard to test that the error-handler works with it. This
		// should cause an error, all right :)
		await db.query('DROP TABLE users CASCADE');
		const resp = await request(app).get('/users').set('authorization', `Bearer ${A2Token}`);
		expect(resp.statusCode).toEqual(500);
	});
});

// /************************************** GET /users/:username */

describe('GET /users/:username', function() {
	test('works for Approved admin', async function() {
		const resp = await request(app).get(`/users/u1`).set('authorization', `Bearer ${A2Token}`);
		expect(resp.body).toEqual({
			user : {
				username      : 'u1',
				firstName     : 'U1F',
				lastName      : 'U1L',
				email         : 'user1@user.com',
				hasPaid       : true,
				imageUrl      : null,
				subscriptions : [ testProductIds[0] ]
			}
		});
	});

	test('Works for same user even if unpaid', async function() {
		const resp = await request(app).get(`/users/u2`).set('authorization', `Bearer ${u2Token}`);
		expect(resp.body).toEqual({
			user : {
				username      : 'u2',
				firstName     : 'U2F',
				lastName      : 'U2L',
				email         : 'user2@user.com',
				hasPaid       : false,
				imageUrl      : null,
				subscriptions : []
			}
		});
	});
	test('Unauth for unapproved admins', async function() {
		const resp = await request(app).get(`/users/u2`).set('authorization', `Bearer ${A1Token}`);
		expect(resp.statusCode).toEqual(401);
	});
	// test('Unauth for for same user if unpaid', async function() {
	// 	const resp = await request(app).get(`/users/u2`).set('authorization', `Bearer ${u2Token}`);
	// 	expect(resp.statusCode).toEqual(401);
	// });

	test('unauth for other users', async function() {
		const resp = await request(app).get(`/users/u1`).set('authorization', `Bearer ${u2Token}`);
		expect(resp.statusCode).toEqual(401);
	});

	test('unauth for anon', async function() {
		const resp = await request(app).get(`/users/u1`);
		expect(resp.statusCode).toEqual(401);
	});

	test('not found if user not found', async function() {
		const resp = await request(app).get(`/users/nope`).set('authorization', `Bearer ${A2Token}`);
		expect(resp.statusCode).toEqual(404);
	});
});

// /************************************** PATCH /users/:username */

describe('PATCH /users/:username', () => {
	test('works for approved admins', async function() {
		const resp = await request(app)
			.patch(`/users/u1`)
			.send({
				firstName : 'New'
			})
			.set('authorization', `Bearer ${A2Token}`);
		expect(resp.body).toEqual({
			user : {
				username  : 'u1',
				firstName : 'New',
				lastName  : 'U1L',
				email     : 'user1@user.com',
				hasPaid   : true,
				imageUrl  : null
			}
		});
	});

	test('works for same user that has paid', async function() {
		const resp = await request(app)
			.patch(`/users/u1`)
			.send({
				firstName : 'New'
			})
			.set('authorization', `Bearer ${u1Token}`);
		expect(resp.body).toEqual({
			user : {
				username  : 'u1',
				firstName : 'New',
				lastName  : 'U1L',
				email     : 'user1@user.com',
				hasPaid   : true,
				imageUrl  : null
			}
		});
	});

	test('unauth if same user that has not paid', async function() {
		const resp = await request(app)
			.patch(`/users/u2`)
			.send({
				firstName : 'New'
			})
			.set('authorization', `Bearer ${u2Token}`);
		expect(resp.statusCode).toEqual(401);
	});

	test('unauth if not same user, even if has paid', async function() {
		const resp = await request(app)
			.patch(`/users/u2`)
			.send({
				firstName : 'New'
			})
			.set('authorization', `Bearer ${u1Token}`);
		expect(resp.statusCode).toEqual(401);
	});

	test('unauth for Admin user that is not approved', async function() {
		const resp = await request(app)
			.patch(`/users/u2`)
			.send({
				firstName : 'New'
			})
			.set('authorization', `Bearer ${A1Token}`);
		expect(resp.statusCode).toEqual(401);
	});

	test('unauth for anon', async function() {
		const resp = await request(app).patch(`/users/u1`).send({
			firstName : 'New'
		});
		expect(resp.statusCode).toEqual(401);
	});

	test('not found if no such user', async function() {
		const resp = await request(app)
			.patch(`/users/nope`)
			.send({
				firstName : 'Nope'
			})
			.set('authorization', `Bearer ${A2Token}`);
		expect(resp.statusCode).toEqual(404);
	});

	test('bad request if invalid data', async function() {
		const resp = await request(app)
			.patch(`/users/u1`)
			.send({
				firstName : 42
			})
			.set('authorization', `Bearer ${A2Token}`);
		expect(resp.statusCode).toEqual(400);
	});

	test('bad request if user tries to change paid status', async function() {
		const resp = await request(app)
			.patch(`/users/u1`)
			.send({
				hasPaid : false
			})
			.set('authorization', `Bearer ${A2Token}`);
		expect(resp.statusCode).toEqual(400);
	});

	test('works: can set new password', async function() {
		const resp = await request(app)
			.patch(`/users/u1`)
			.send({
				password : 'new-password'
			})
			.set('authorization', `Bearer ${A2Token}`);
		expect(resp.body).toEqual({
			user : {
				username  : 'u1',
				firstName : 'U1F',
				lastName  : 'U1L',
				email     : 'user1@user.com',
				hasPaid   : true,
				imageUrl  : null
			}
		});
		const isSuccessful = await User.authenticate('u1', 'new-password');
		expect(isSuccessful).toBeTruthy();
	});
});
// /************************************** PATCH /users/:username/admin */

describe('PATCH /users/:username/admin', () => {
	test('works to change paid status for approved admins', async function() {
		const resp = await request(app)
			.patch(`/users/u2/admin`)
			.send({
				hasPaid : true
			})
			.set('authorization', `Bearer ${A2Token}`);
		expect(resp.body).toEqual({
			user : {
				username  : 'u2',
				firstName : 'U2F',
				lastName  : 'U2L',
				email     : 'user2@user.com',
				hasPaid   : true,
				imageUrl  : null
			}
		});
	});

	test('unauth even for same user who has paid', async function() {
		const resp = await request(app)
			.patch(`/users/u1/admin`)
			.send({
				hasPaid : false
			})
			.set('authorization', `Bearer ${u1Token}`);
		expect(resp.statusCode).toEqual(401);
	});

	test('unauth for Admin user that is not approved', async function() {
		const resp = await request(app)
			.patch(`/users/u2/admin`)
			.send({
				hasPaid : false
			})
			.set('authorization', `Bearer ${A1Token}`);
		expect(resp.statusCode).toEqual(401);
	});

	test('unauth for anon', async function() {
		const resp = await request(app).patch(`/users/u1/admin`).send({
			firstName : 'New'
		});
		expect(resp.statusCode).toEqual(401);
	});

	test('not found if no such user', async function() {
		const resp = await request(app)
			.patch(`/users/nope/admin`)
			.send({
				firstName : 'Nope'
			})
			.set('authorization', `Bearer ${A2Token}`);
		expect(resp.statusCode).toEqual(404);
	});

	test('bad request if invalid data', async function() {
		const resp = await request(app)
			.patch(`/users/u1/admin`)
			.send({
				firstName : 42
			})
			.set('authorization', `Bearer ${A2Token}`);
		expect(resp.statusCode).toEqual(400);
	});

	test('works: can set new password', async function() {
		const resp = await request(app)
			.patch(`/users/u1/admin`)
			.send({
				password : 'new-password'
			})
			.set('authorization', `Bearer ${A2Token}`);
		expect(resp.body).toEqual({
			user : {
				username  : 'u1',
				firstName : 'U1F',
				lastName  : 'U1L',
				email     : 'user1@user.com',
				hasPaid   : true,
				imageUrl  : null
			}
		});
		const isSuccessful = await User.authenticate('u1', 'new-password');
		expect(isSuccessful).toBeTruthy();
	});
});

// /************************************** DELETE /users/:username */

describe('DELETE /users/:username', function() {
	test('works for approved admin', async function() {
		const resp = await request(app).delete(`/users/u1`).set('authorization', `Bearer ${A2Token}`);
		expect(resp.body).toEqual({ deleted: 'u1' });
	});

	test('works for same user who has paid', async function() {
		const resp = await request(app).delete(`/users/u1`).set('authorization', `Bearer ${u1Token}`);
		expect(resp.body).toEqual({ deleted: 'u1' });
	});

	test('unauth if not same user, even if paid', async function() {
		const resp = await request(app).delete(`/users/u2`).set('authorization', `Bearer ${u1Token}`);
		expect(resp.statusCode).toEqual(401);
	});
	test('unauth for unpaid', async function() {
		const resp = await request(app).delete(`/users/u2`).set('authorization', `Bearer ${u2Token}`);
		expect(resp.statusCode).toEqual(401);
	});
	test('unauth for unapproved admin', async function() {
		const resp = await request(app).delete(`/users/u2`).set('authorization', `Bearer ${A1Token}`);
		expect(resp.statusCode).toEqual(401);
	});

	test('unauth for anon', async function() {
		const resp = await request(app).delete(`/users/u1`);
		expect(resp.statusCode).toEqual(401);
	});

	test('not found if user missing', async function() {
		const resp = await request(app).delete(`/users/nope`).set('authorization', `Bearer ${A2Token}`);
		expect(resp.statusCode).toEqual(404);
	});
});

// /************************************** POST /users/:username/products/:id */

describe('POST /users/:username/products/:id', function() {
	test('works for Approved admin', async function() {
		const resp = await request(app)
			.post(`/users/u1/products/${testProductIds[1]}`)
			.set('authorization', `Bearer ${A2Token}`);
		expect(resp.body).toEqual({ subscribed: testProductIds[1] });
	});

	test('works for same paid user', async function() {
		const resp = await request(app)
			.post(`/users/u1/products/${testProductIds[1]}`)
			.set('authorization', `Bearer ${u1Token}`);
		expect(resp.body).toEqual({ subscribed: testProductIds[1] });
	});

	test('unauth for others, even if paid', async function() {
		const resp = await request(app)
			.post(`/users/u2/products/${testProductIds[1]}`)
			.set('authorization', `Bearer ${u1Token}`);
		expect(resp.statusCode).toEqual(401);
	});
	test('unauth for unapproved Admin', async function() {
		const resp = await request(app)
			.post(`/users/u1/products/${testProductIds[1]}`)
			.set('authorization', `Bearer ${A1Token}`);
		expect(resp.statusCode).toEqual(401);
	});

	test('unauth for anon', async function() {
		const resp = await request(app).post(`/users/u1/products/${testProductIds[1]}`);
		expect(resp.statusCode).toEqual(401);
	});

	test('not found for no such username', async function() {
		const resp = await request(app)
			.post(`/users/nope/products/${testProductIds[1]}`)
			.set('authorization', `Bearer ${A2Token}`);
		expect(resp.statusCode).toEqual(404);
	});

	test('not found for no such product', async function() {
		const resp = await request(app).post(`/users/u1/products/0`).set('authorization', `Bearer ${A2Token}`);
		expect(resp.statusCode).toEqual(404);
	});

	test('bad request invalid product id', async function() {
		const resp = await request(app).post(`/users/u1/products/0`).set('authorization', `Bearer ${A2Token}`);
		expect(resp.statusCode).toEqual(404);
	});
});
