'use strict';

const request = require('supertest');

const db = require('../db.js');
const app = require('../app');
const Admin = require('../models/admin');

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

/************************************** POST /admins */

describe('POST /admins', function() {
	test('works for Approved admins: create other admins', async function() {
		const resp = await request(app)
			.post('/admins')
			.send({
				username   : 'u-new',
				firstName  : 'First-new',
				lastName   : 'Last-newL',
				password   : 'password-new',
				email      : 'new@email.com',
				isApproved : true
			})
			.set('authorization', `Bearer ${A2Token}`);
		expect(resp.statusCode).toEqual(201);
		expect(resp.body).toEqual({
			admin : {
				username   : 'u-new',
				firstName  : 'First-new',
				lastName   : 'Last-newL',
				email      : 'new@email.com',
				isApproved : true
			},
			token : expect.any(String)
		});
	});

	test('unauth for users', async function() {
		const resp = await request(app)
			.post('/admins')
			.send({
				username   : 'u-new',
				firstName  : 'First-new',
				lastName   : 'Last-newL',
				password   : 'password-new',
				email      : 'new@email.com',
				isApproved : true
			})
			.set('authorization', `Bearer ${u1Token}`);
		expect(resp.statusCode).toEqual(401);
	});
	test('unauth for unapproved admins', async function() {
		const resp = await request(app)
			.post('/admins')
			.send({
				username   : 'u-new',
				firstName  : 'First-new',
				lastName   : 'Last-newL',
				password   : 'password-new',
				email      : 'new@email.com',
				isApproved : true
			})
			.set('authorization', `Bearer ${A1Token}`);
		expect(resp.statusCode).toEqual(401);
	});

	test('unauth for anon', async function() {
		const resp = await request(app).post('/admins').send({
			username   : 'u-new',
			firstName  : 'First-new',
			lastName   : 'Last-newL',
			password   : 'password-new',
			email      : 'new@email.com',
			isApproved : true
		});
		expect(resp.statusCode).toEqual(401);
	});

	test('bad request if missing data', async function() {
		const resp = await request(app)
			.post('/admins')
			.send({
				username : 'u-new'
			})
			.set('authorization', `Bearer ${A2Token}`);
		expect(resp.statusCode).toEqual(400);
	});

	test('bad request if invalid data', async function() {
		const resp = await request(app)
			.post('/admins')
			.send({
				username   : 'u-new',
				firstName  : 'First-new',
				lastName   : 'Last-newL',
				password   : 'password-new',
				email      : 'not-an-email',
				isApproved : true
			})
			.set('authorization', `Bearer ${A2Token}`);
		expect(resp.statusCode).toEqual(400);
	});
});

// /************************************** GET /admins */

describe('GET /admins', function() {
	test('works for approved admins', async function() {
		const resp = await request(app).get('/admins').set('authorization', `Bearer ${A2Token}`);
		expect(resp.body).toEqual({
			admins : [
				{
					username   : 'a1',
					firstName  : 'A1F',
					lastName   : 'A1L',
					email      : 'admin1@admin.com',
					isApproved : true,
					imageUrl   : null
				},
				{
					username   : 'a2',
					firstName  : 'A2F',
					lastName   : 'A2L',
					email      : 'admin2@admin.com',
					isApproved : false,
					imageUrl   : null
				},
				{
					username   : 'a3',
					firstName  : 'A3F',
					lastName   : 'A3L',
					email      : 'admin3@admin.com',
					isApproved : false,
					imageUrl   : null
				}
			]
		});
	});

	test('unauth for non-admin users', async function() {
		const resp = await request(app).get('/admins').set('authorization', `Bearer ${u1Token}`);
		expect(resp.statusCode).toEqual(401);
	});

	test('unauth for unapproved admins', async function() {
		const resp = await request(app).get('/admins').set('authorization', `Bearer ${A1Token}`);
		expect(resp.statusCode).toEqual(401);
	});

	test('unauth for anon', async function() {
		const resp = await request(app).get('/admins');
		expect(resp.statusCode).toEqual(401);
	});

	test('fails: test next() handler', async function() {
		// there's no normal failure event which will cause this route to fail ---
		// thus making it hard to test that the error-handler works with it. This
		// should cause an error, all right :)
		await db.query('DROP TABLE admins CASCADE');
		const resp = await request(app).get('/admins').set('authorization', `Bearer ${A2Token}`);
		expect(resp.statusCode).toEqual(500);
	});
});

// /************************************** GET /admins/:username */

describe('GET /admins/:username', function() {
	test('works for Approved admin', async function() {
		const resp = await request(app).get(`/admins/a1`).set('authorization', `Bearer ${A2Token}`);
		expect(resp.body).toEqual({
			admin : {
				username   : 'a1',
				firstName  : 'A1F',
				lastName   : 'A1L',
				email      : 'admin1@admin.com',
				isApproved : true,
				imageUrl   : null
			}
		});
	});

	test('Unauth for unapproved admins', async function() {
		const resp = await request(app).get(`/admins/a1`).set('authorization', `Bearer ${A1Token}`);
		expect(resp.statusCode).toEqual(401);
	});

	test('unauth for other users', async function() {
		const resp = await request(app).get(`/admins/a1`).set('authorization', `Bearer ${u2Token}`);
		expect(resp.statusCode).toEqual(401);
	});

	test('unauth for anon', async function() {
		const resp = await request(app).get(`/admins/a1`);
		expect(resp.statusCode).toEqual(401);
	});

	test('not found if user not found', async function() {
		const resp = await request(app).get(`/admins/nope`).set('authorization', `Bearer ${A2Token}`);
		expect(resp.statusCode).toEqual(404);
	});
});

/************************************** PATCH /admins/:username */

describe('PATCH /admins/:username', () => {
	test('works for approved admins', async function() {
		const resp = await request(app)
			.patch(`/admins/a1`)
			.send({
				firstName : 'New'
			})
			.set('authorization', `Bearer ${A2Token}`);
		expect(resp.body).toEqual({
			admin : {
				username   : 'a1',
				firstName  : 'New',
				lastName   : 'A1L',
				email      : 'admin1@admin.com',
				isApproved : true,
				imageUrl   : null
			}
		});
	});

	test('unauth if other users', async function() {
		const resp = await request(app)
			.patch(`/admins/a1`)
			.send({
				firstName : 'New'
			})
			.set('authorization', `Bearer ${u1Token}`);
		expect(resp.statusCode).toEqual(401);
	});

	test('unauth for Admin user that is not approved', async function() {
		const resp = await request(app)
			.patch(`/admins/a2`)
			.send({
				firstName : 'New'
			})
			.set('authorization', `Bearer ${A1Token}`);
		expect(resp.statusCode).toEqual(401);
	});

	test('unauth for anon', async function() {
		const resp = await request(app).patch(`/admins/a1`).send({
			firstName : 'New'
		});
		expect(resp.statusCode).toEqual(401);
	});

	test('not found if no such user', async function() {
		const resp = await request(app)
			.patch(`/admins/nope`)
			.send({
				firstName : 'Nope'
			})
			.set('authorization', `Bearer ${A2Token}`);
		expect(resp.statusCode).toEqual(404);
	});

	test('bad request if invalid data', async function() {
		const resp = await request(app)
			.patch(`/admins/a1`)
			.send({
				firstName : 42
			})
			.set('authorization', `Bearer ${A2Token}`);
		expect(resp.statusCode).toEqual(400);
	});

	test('works: can set new password', async function() {
		const resp = await request(app)
			.patch(`/admins/a1`)
			.send({
				password : 'new-password'
			})
			.set('authorization', `Bearer ${A2Token}`);
		expect(resp.body).toEqual({
			admin : {
				username   : 'a1',
				firstName  : 'A1F',
				lastName   : 'A1L',
				email      : 'admin1@admin.com',
				isApproved : true,
				imageUrl   : null
			}
		});
		const isSuccessful = await Admin.authenticate('a1', 'new-password');
		expect(isSuccessful).toBeTruthy();
	});
});

/************************************** DELETE /admins/:username */

describe('DELETE /admins/:username', function() {
	test('works for approved admin', async function() {
		const resp = await request(app).delete(`/admins/a1`).set('authorization', `Bearer ${A2Token}`);
		expect(resp.body).toEqual({ deleted: 'a1' });
	});

	test('unauth if non admin user', async function() {
		const resp = await request(app).delete(`/admins/a2`).set('authorization', `Bearer ${u1Token}`);
		expect(resp.statusCode).toEqual(401);
	});

	test('unauth for unapproved admin', async function() {
		const resp = await request(app).delete(`/admins/a2`).set('authorization', `Bearer ${A1Token}`);
		expect(resp.statusCode).toEqual(401);
	});

	test('unauth for anon', async function() {
		const resp = await request(app).delete(`/admins/a1`);
		expect(resp.statusCode).toEqual(401);
	});

	test('not found if user missing', async function() {
		const resp = await request(app).delete(`/admins/nope`).set('authorization', `Bearer ${A2Token}`);
		expect(resp.statusCode).toEqual(404);
	});
});
