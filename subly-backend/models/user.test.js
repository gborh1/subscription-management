'use strict';

const { NotFoundError, BadRequestError, UnauthorizedError } = require('../expressError');
const db = require('../db.js');
const User = require('./user.js');
const { commonBeforeAll, commonBeforeEach, commonAfterEach, commonAfterAll, testProductIds } = require('./_testCommon');

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** authenticate */

describe('authenticate', function() {
	test('works', async function() {
		const user = await User.authenticate('u1', 'password1');
		expect(user).toEqual({
			username  : 'u1',
			firstName : 'U1F',
			lastName  : 'U1L',
			email     : 'u1@email.com',
			imageUrl  : 'http://u1.img',
			hasPaid   : false
		});
	});

	test('unauth if no such user', async function() {
		try {
			await User.authenticate('nope', 'password');
			fail();
		} catch (err) {
			expect(err instanceof UnauthorizedError).toBeTruthy();
		}
	});

	test('unauth if wrong password', async function() {
		try {
			await User.authenticate('c1', 'wrong');
			fail();
		} catch (err) {
			expect(err instanceof UnauthorizedError).toBeTruthy();
		}
	});
});

/************************************** register */

describe('register', function() {
	const newUser = {
		username  : 'new',
		firstName : 'Test',
		lastName  : 'Tester',
		email     : 'test@test.com',
		hasPaid   : false
	};

	test('works', async function() {
		let user = await User.register({
			...newUser,
			password : 'password'
		});
		expect(user).toEqual(newUser);
		const found = await db.query("SELECT * FROM users WHERE username = 'new'");
		expect(found.rows.length).toEqual(1);
		expect(found.rows[0].has_paid).toEqual(false);
		expect(found.rows[0].password.startsWith('$2b$')).toEqual(true);
	});

	test('works: adds paid', async function() {
		let user = await User.register({
			...newUser,
			password : 'password',
			hasPaid  : true
		});
		expect(user).toEqual({ ...newUser, hasPaid: true });
		const found = await db.query("SELECT * FROM users WHERE username = 'new'");
		expect(found.rows.length).toEqual(1);
		expect(found.rows[0].has_paid).toEqual(true);
		expect(found.rows[0].password.startsWith('$2b$')).toEqual(true);
	});

	test('bad request with dup data', async function() {
		try {
			await User.register({
				...newUser,
				password : 'password'
			});
			await User.register({
				...newUser,
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
		const users = await User.findAll();
		expect(users).toEqual([
			{
				username  : 'u1',
				firstName : 'U1F',
				lastName  : 'U1L',
				email     : 'u1@email.com',
				hasPaid   : false,
				imageUrl  : 'http://u1.img'
			},
			{
				username  : 'u2',
				firstName : 'U2F',
				lastName  : 'U2L',
				email     : 'u2@email.com',
				hasPaid   : false,
				imageUrl  : null
			}
		]);
	});
});

/************************************** get */

describe('get', function() {
	test('works', async function() {
		let user = await User.get('u1');
		expect(user).toEqual({
			username      : 'u1',
			firstName     : 'U1F',
			lastName      : 'U1L',
			email         : 'u1@email.com',
			hasPaid       : false,
			imageUrl      : 'http://u1.img',
			subscriptions : [ testProductIds[0] ]
		});
	});

	test('not found if no such user', async function() {
		try {
			await User.get('nope');
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
		hasPaid   : true,
		imageUrl  : 'newUrl.jpg'
	};

	test('works', async function() {
		let user = await User.update('u1', updateData);
		expect(user).toEqual({
			username : 'u1',
			...updateData
		});
	});

	test('works: set password', async function() {
		let user = await User.update('u1', {
			password : 'new'
		});
		expect(user).toEqual({
			username  : 'u1',
			firstName : 'U1F',
			lastName  : 'U1L',
			email     : 'u1@email.com',
			hasPaid   : false,
			imageUrl  : 'http://u1.img'
		});
		const found = await db.query("SELECT * FROM users WHERE username = 'u1'");
		expect(found.rows.length).toEqual(1);
		expect(found.rows[0].password.startsWith('$2b$')).toEqual(true);
	});

	test('not found if no such user', async function() {
		try {
			await User.update('nope', {
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
			await User.update('u1', {});
			fail();
		} catch (err) {
			expect(err instanceof BadRequestError).toBeTruthy();
		}
	});
});

/************************************** remove */

describe('remove', function() {
	test('works', async function() {
		await User.remove('u1');
		const res = await db.query("SELECT * FROM users WHERE username='u1'");
		expect(res.rows.length).toEqual(0);
	});

	test('not found if no such user', async function() {
		try {
			await User.remove('nope');
			fail();
		} catch (err) {
			expect(err instanceof NotFoundError).toBeTruthy();
		}
	});
});

/************************************** Subscribe to product */

describe('subscribeToProduct', function() {
	test('works', async function() {
		await User.subscribeToProduct('u1', testProductIds[1]);

		const res = await db.query('SELECT * FROM subscriptions WHERE product_id=$1', [ testProductIds[1] ]);
		expect(res.rows).toEqual([
			{
				product_id : testProductIds[1],
				username   : 'u1'
			}
		]);
	});

	test('not found if no such product', async function() {
		try {
			// await User.subscribeToProduct('u1', 0, 'subscribed');
			await User.subscribeToProduct('u1', 0);
			fail('the product was found, so there was no error');
		} catch (err) {
			expect(err instanceof NotFoundError).toBeTruthy();
		}
	});

	test('not found if no such user', async function() {
		try {
			await User.subscribeToProduct('nope', testProductIds[0]);
			fail();
		} catch (err) {
			expect(err instanceof NotFoundError).toBeTruthy();
		}
	});
});
