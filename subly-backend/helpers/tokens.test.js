const jwt = require('jsonwebtoken');
const { createUserToken, createAdminToken } = require('./tokens');
const { SECRET_KEY } = require('../config');

/********************** USER TOKEN *************/

describe('createUserToken', function() {
	test('works: not paid', function() {
		const token = createUserToken({ username: 'test', hasPaid: false });
		const payload = jwt.verify(token, SECRET_KEY);
		expect(payload).toEqual({
			iat      : expect.any(Number),
			username : 'test',
			hasPaid  : false
		});
	});

	test('works: paid', function() {
		const token = createUserToken({ username: 'test', hasPaid: true });
		const payload = jwt.verify(token, SECRET_KEY);
		expect(payload).toEqual({
			iat      : expect.any(Number),
			username : 'test',
			hasPaid  : true
		});
	});

	test('works: default not paid', function() {
		// given the unpaid user will be allowed in if this didn't work, checking this specifically
		const token = createUserToken({ username: 'test' });
		const payload = jwt.verify(token, SECRET_KEY);
		expect(payload).toEqual({
			iat      : expect.any(Number),
			username : 'test',
			hasPaid  : false
		});
	});
});

/****************************** ADMIN TOKEN  ****************  */

describe('createAdminToken', function() {
	test('works', function() {
		const token = createAdminToken({ username: 'test' });
		const payload = jwt.verify(token, SECRET_KEY);
		expect(payload).toEqual({
			iat   : expect.any(Number),
			admin : 'test'
		});
	});
});
