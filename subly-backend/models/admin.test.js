'use strict';

const { NotFoundError, BadRequestError, UnauthorizedError } = require('../expressError');
const db = require('../db.js');
const Admin = require('./admin.js');
const { commonBeforeAll, commonBeforeEach, commonAfterEach, commonAfterAll } = require('./_testCommon');

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** authenticate */

describe('authenticate', function() {
	test('works', async function() {
		const admin = await Admin.authenticate('a1', 'password1');
		expect(admin).toEqual({
			username  : 'a1',
			firstName : 'A1F',
			lastName  : 'A1L',
			email     : 'a1@email.com',
			imageUrl  : 'http://a1.img'
		});
	});

	test('unauth if no such user', async function() {
		try {
			await Admin.authenticate('nope', 'password');
			fail();
		} catch (err) {
			expect(err instanceof UnauthorizedError).toBeTruthy();
		}
	});

	test('unauth if wrong password', async function() {
		try {
			await Admin.authenticate('c1', 'wrong');
			fail();
		} catch (err) {
			expect(err instanceof UnauthorizedError).toBeTruthy();
		}
	});
});

/************************************** register */

describe('register', function() {
	const newAdmin = {
		username  : 'new',
		firstName : 'Test',
		lastName  : 'Tester',
		email     : 'test@test.com'
	};

	test('works', async function() {
		let admin = await Admin.register({
			...newAdmin,
			password : 'password'
		});
		expect(admin).toEqual(newAdmin);
		const found = await db.query("SELECT * FROM admins WHERE username = 'new'");
		expect(found.rows.length).toEqual(1);
		expect(found.rows[0].password.startsWith('$2b$')).toEqual(true);
	});

	test('bad request with dup data', async function() {
		try {
			await Admin.register({
				...newAdmin,
				password : 'password'
			});
			await Admin.register({
				...newAdmin,
				password : 'password'
			});
			fail();
		} catch (err) {
			expect(err instanceof BadRequestError).toBeTruthy();
		}
	});
});

/************************************** findAll */

describe('findAll', function() {
	test('works', async function() {
		const admins = await Admin.findAll();
		expect(admins).toEqual([
			{
				username  : 'a1',
				firstName : 'A1F',
				lastName  : 'A1L',
				email     : 'a1@email.com',
				imageUrl  : 'http://a1.img'
			},
			{
				username  : 'a2',
				firstName : 'A2F',
				lastName  : 'A2L',
				email     : 'a2@email.com',
				imageUrl  : null
			}
		]);
	});
});

/************************************** get */

describe('get', function() {
	test('works', async function() {
		let admin = await Admin.get('a1');
		expect(admin).toEqual({
			username  : 'a1',
			firstName : 'A1F',
			lastName  : 'A1L',
			email     : 'a1@email.com',
			imageUrl  : 'http://a1.img'
		});
	});

	test('not found if no such admin', async function() {
		try {
			await Admin.get('nope');
			fail();
		} catch (err) {
			expect(err instanceof NotFoundError).toBeTruthy();
		}
	});
});

/************************************** update */

describe('update', function() {
	const updateData = {
		firstName : 'NewF',
		lastName  : 'NewF',
		email     : 'new@email.com',
		imageUrl  : 'newUrl.jpg'
	};

	test('works', async function() {
		let admin = await Admin.update('a1', updateData);
		expect(admin).toEqual({
			username : 'a1',
			...updateData
		});
	});

	test('works: set password', async function() {
		let admin = await Admin.update('a1', {
			password : 'new'
		});
		expect(admin).toEqual({
			username  : 'a1',
			firstName : 'A1F',
			lastName  : 'A1L',
			email     : 'a1@email.com',
			imageUrl  : 'http://a1.img'
		});
		const found = await db.query("SELECT * FROM admins WHERE username = 'a1'");
		expect(found.rows.length).toEqual(1);
		expect(found.rows[0].password.startsWith('$2b$')).toEqual(true);
	});

	test('not found if no such admin', async function() {
		try {
			await Admin.update('nope', {
				firstName : 'test'
			});
			fail();
		} catch (err) {
			expect(err instanceof NotFoundError).toBeTruthy();
		}
	});

	test('bad request if no data', async function() {
		expect.assertions(1);
		try {
			await Admin.update('a1', {});
			fail();
		} catch (err) {
			expect(err instanceof BadRequestError).toBeTruthy();
		}
	});
});

/************************************** remove */

describe('remove', function() {
	test('works', async function() {
		await Admin.remove('a1');
		const res = await db.query("SELECT * FROM admins WHERE username='a1'");
		expect(res.rows.length).toEqual(0);
	});

	test('not found if no such user', async function() {
		try {
			await Admin.remove('nope');
			fail();
		} catch (err) {
			expect(err instanceof NotFoundError).toBeTruthy();
		}
	});
});
