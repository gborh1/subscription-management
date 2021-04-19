'use strict';

const request = require('supertest');

const app = require('../app');

const { commonBeforeAll, commonBeforeEach, commonAfterEach, commonAfterAll } = require('./_testCommon');

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /auth/userToken */

describe('POST /auth/userToken', function() {
	test('works', async function() {
		const resp = await request(app).post('/auth/userToken').send({
			username : 'u1',
			password : 'password1'
		});
		expect(resp.body).toEqual({
			token : expect.any(String)
		});
	});

	test('unauth with non-existent user', async function() {
		const resp = await request(app).post('/auth/userToken').send({
			username : 'no-such-user',
			password : 'password1'
		});
		expect(resp.statusCode).toEqual(401);
	});

	test('unauth with wrong password', async function() {
		const resp = await request(app).post('/auth/userToken').send({
			username : 'u1',
			password : 'nope'
		});
		expect(resp.statusCode).toEqual(401);
	});

	test('bad request with missing data', async function() {
		const resp = await request(app).post('/auth/userToken').send({
			username : 'u1'
		});
		expect(resp.statusCode).toEqual(400);
	});

	test('bad request with invalid data', async function() {
		const resp = await request(app).post('/auth/userToken').send({
			username : 42,
			password : 'above-is-a-number'
		});
		expect(resp.statusCode).toEqual(400);
	});
});
/************************************** POST /auth/adminToken */

describe('POST /auth/adminToken', function() {
	test('works', async function() {
		const resp = await request(app).post('/auth/adminToken').send({
			username : 'a1',
			password : 'password1'
		});
		expect(resp.body).toEqual({
			token : expect.any(String)
		});
	});

	test('unauth with non-existent user', async function() {
		const resp = await request(app).post('/auth/adminToken').send({
			username : 'no-such-user',
			password : 'password1'
		});
		expect(resp.statusCode).toEqual(401);
	});

	test('unauth with wrong password', async function() {
		const resp = await request(app).post('/auth/userToken').send({
			username : 'a1',
			password : 'nope'
		});
		expect(resp.statusCode).toEqual(401);
	});

	test('bad request with missing data', async function() {
		const resp = await request(app).post('/auth/adminToken').send({
			username : 'a1'
		});
		expect(resp.statusCode).toEqual(400);
	});

	test('bad request with invalid data', async function() {
		const resp = await request(app).post('/auth/adminToken').send({
			username : 42,
			password : 'above-is-a-number'
		});
		expect(resp.statusCode).toEqual(400);
	});
});

/************************************** POST /auth/register */

describe('POST /auth/userRegister', function() {
	test('works for anon', async function() {
		const resp = await request(app).post('/auth/userRegister').send({
			username  : 'new',
			firstName : 'first',
			lastName  : 'last',
			password  : 'password',
			email     : 'new@email.com'
		});
		expect(resp.statusCode).toEqual(201);
		expect(resp.body).toEqual({
			token : expect.any(String)
		});
	});

	test('bad request with missing fields', async function() {
		const resp = await request(app).post('/auth/userRegister').send({
			username : 'new'
		});
		expect(resp.statusCode).toEqual(400);
	});

	test('bad request with invalid data', async function() {
		const resp = await request(app).post('/auth/userRegister').send({
			username  : 'new',
			firstName : 'first',
			lastName  : 'last',
			password  : 'password',
			email     : 'not-an-email'
		});
		expect(resp.statusCode).toEqual(400);
	});
});

describe('POST /auth/adminRegister', function() {
	test('works for anon', async function() {
		const resp = await request(app).post('/auth/adminRegister').send({
			username  : 'new',
			firstName : 'first',
			lastName  : 'last',
			password  : 'password',
			email     : 'new@email.com'
		});
		expect(resp.statusCode).toEqual(201);
		expect(resp.body).toEqual({
			token : expect.any(String)
		});
	});

	test('bad request with missing fields', async function() {
		const resp = await request(app).post('/auth/adminRegister').send({
			username : 'new'
		});
		expect(resp.statusCode).toEqual(400);
	});

	test('bad request with invalid data', async function() {
		const resp = await request(app).post('/auth/adminRegister').send({
			username  : 'new',
			firstName : 'first',
			lastName  : 'last',
			password  : 'password',
			email     : 'not-an-email'
		});
		expect(resp.statusCode).toEqual(400);
	});
});
