'use strict';

const jwt = require('jsonwebtoken');
const { UnauthorizedError } = require('../expressError');
const {
	authenticateJWT,
	ensureUserLoggedIn,
	ensureUserHasPaid,
	ensureAdmin,
	ensureAdminIsApproved,
	ensureCorrectUserOrAdmin,
	ensurePaidUserOrAdmin
} = require('./auth');

const { SECRET_KEY } = require('../config');
const testUJwt = jwt.sign({ username: 'test', hasPaid: false }, SECRET_KEY);
const badUJwt = jwt.sign({ username: 'test', hasPaid: false }, 'wrong');
const testAJwt = jwt.sign({ admin: 'test', isApproved: false }, SECRET_KEY);
const badAJwt = jwt.sign({ admin: 'test', isApproved: false }, 'wrong');

describe('authenticateJWT', function() {
	test('works for user: via header', function() {
		expect.assertions(2);
		const req = { headers: { authorization: `Bearer ${testUJwt}` } };
		const res = { locals: {} };
		const next = function(err) {
			expect(err).toBeFalsy();
		};
		authenticateJWT(req, res, next);
		expect(res.locals).toEqual({
			user : {
				iat      : expect.any(Number),
				username : 'test',
				hasPaid  : false
			}
		});
	});
	test('works for admin: via header', function() {
		expect.assertions(2);
		const req = { headers: { authorization: `Bearer ${testAJwt}` } };
		const res = { locals: {} };
		const next = function(err) {
			expect(err).toBeFalsy();
		};
		authenticateJWT(req, res, next);
		expect(res.locals).toEqual({
			user : {
				iat        : expect.any(Number),
				admin      : 'test',
				isApproved : false
			}
		});
	});

	test('works: no header', function() {
		expect.assertions(2);
		const req = {};
		const res = { locals: {} };
		const next = function(err) {
			expect(err).toBeFalsy();
		};
		authenticateJWT(req, res, next);
		expect(res.locals).toEqual({});
	});

	test('works: invalid token', function() {
		expect.assertions(2);
		const req = { headers: { authorization: `Bearer ${badUJwt}` } };
		const res = { locals: {} };
		const next = function(err) {
			expect(err).toBeFalsy();
		};
		authenticateJWT(req, res, next);
		expect(res.locals).toEqual({});
	});
});

describe('ensureUserLoggedIn', function() {
	test('works', function() {
		expect.assertions(1);
		const req = {};
		const res = { locals: { user: { username: 'test', hasPaid: false } } };
		const next = function(err) {
			expect(err).toBeFalsy();
		};
		ensureUserLoggedIn(req, res, next);
	});

	test('unauth if no login', function() {
		expect.assertions(1);
		const req = {};
		const res = { locals: { user: { randomProp: 'test', hasPaid: false } } };
		const next = function(err) {
			expect(err instanceof UnauthorizedError).toBeTruthy();
		};
		ensureUserLoggedIn(req, res, next);
	});
	test('unauth if anon', function() {
		expect.assertions(1);
		const req = {};
		const res = { locals: {} };
		const next = function(err) {
			expect(err instanceof UnauthorizedError).toBeTruthy();
		};
		ensureUserLoggedIn(req, res, next);
	});
});

describe('ensureAdmin', function() {
	test('works', function() {
		expect.assertions(1);
		const req = {};
		const res = { locals: { user: { admin: 'test', isApproved: false } } };
		const next = function(err) {
			expect(err).toBeFalsy();
		};
		ensureAdmin(req, res, next);
	});

	test('unauth if not admin', function() {
		expect.assertions(1);
		const req = {};
		const res = { locals: { user: { username: 'test', isApproved: false } } };
		const next = function(err) {
			expect(err instanceof UnauthorizedError).toBeTruthy();
		};
		ensureAdmin(req, res, next);
	});

	test('unauth if anon', function() {
		expect.assertions(1);
		const req = {};
		const res = { locals: {} };
		const next = function(err) {
			expect(err instanceof UnauthorizedError).toBeTruthy();
		};
		ensureAdmin(req, res, next);
	});
});

describe('ensureUserHasPaid', function() {
	test('works', function() {
		expect.assertions(1);
		const req = {};
		const res = { locals: { user: { username: 'test', hasPaid: true } } };
		const next = function(err) {
			expect(err).toBeFalsy();
		};
		ensureUserHasPaid(req, res, next);
	});

	test('unauth if not paid', function() {
		expect.assertions(1);
		const req = {};
		const res = { locals: { user: { username: 'test', hasPaid: false } } };
		const next = function(err) {
			expect(err instanceof UnauthorizedError).toBeTruthy();
		};
		ensureUserHasPaid(req, res, next);
	});

	test('unauth if anon', function() {
		expect.assertions(1);
		const req = {};
		const res = { locals: {} };
		const next = function(err) {
			expect(err instanceof UnauthorizedError).toBeTruthy();
		};
		ensureUserHasPaid(req, res, next);
	});
});

describe('ensureAdminIsApproved', function() {
	test('works', function() {
		expect.assertions(1);
		const req = {};
		const res = { locals: { user: { admin: 'test', isApproved: true } } };
		const next = function(err) {
			expect(err).toBeFalsy();
		};
		ensureAdminIsApproved(req, res, next);
	});

	test('unauth if not approved', function() {
		expect.assertions(1);
		const req = {};
		const res = { locals: { user: { admin: 'test', isApproved: false } } };
		const next = function(err) {
			expect(err instanceof UnauthorizedError).toBeTruthy();
		};
		ensureAdminIsApproved(req, res, next);
	});

	test('unauth if anon', function() {
		expect.assertions(1);
		const req = {};
		const res = { locals: {} };
		const next = function(err) {
			expect(err instanceof UnauthorizedError).toBeTruthy();
		};
		ensureAdminIsApproved(req, res, next);
	});
});

describe('ensureCorrectUserOrAdmin', function() {
	test('works: admin approved', function() {
		expect.assertions(1);
		const req = { params: { username: 'test' } };
		const res = { locals: { user: { admin: 'test', isApproved: true } } };
		const next = function(err) {
			expect(err).toBeFalsy();
		};
		ensureCorrectUserOrAdmin(req, res, next);
	});
	test('unauth: admin token but not approved', function() {
		expect.assertions(1);
		const req = { params: { username: 'test' } };
		const res = { locals: { user: { admin: 'test', isApproved: false } } };
		const next = function(err) {
			expect(err instanceof UnauthorizedError).toBeTruthy();
		};
		ensureCorrectUserOrAdmin(req, res, next);
	});

	test('works: same user that paid', function() {
		expect.assertions(1);
		const req = { params: { username: 'test' } };
		const res = { locals: { user: { username: 'test', hasPaid: true } } };
		const next = function(err) {
			expect(err).toBeFalsy();
		};
		ensureCorrectUserOrAdmin(req, res, next);
	});

	test('unauth: same user who has not paid', function() {
		expect.assertions(1);
		const req = { params: { username: 'test' } };
		const res = { locals: { user: { username: 'test', hasPaid: false } } };
		const next = function(err) {
			expect(err instanceof UnauthorizedError).toBeTruthy();
		};
		ensureCorrectUserOrAdmin(req, res, next);
	});

	test('unauth: mismatch. user who has paid, but on wrong route', function() {
		expect.assertions(1);
		const req = { params: { username: 'wrong' } };
		const res = { locals: { user: { username: 'test', hasPaid: true } } };
		const next = function(err) {
			expect(err instanceof UnauthorizedError).toBeTruthy();
		};
		ensureCorrectUserOrAdmin(req, res, next);
	});

	test('unauth: if anon', function() {
		expect.assertions(1);
		const req = { params: { username: 'test' } };
		const res = { locals: {} };
		const next = function(err) {
			expect(err instanceof UnauthorizedError).toBeTruthy();
		};
		ensureCorrectUserOrAdmin(req, res, next);
	});
});

describe('ensurePaidUserOrAdmin', function() {
	test('works: admin approved', function() {
		expect.assertions(1);
		const req = { params: { username: 'test' } };
		const res = { locals: { user: { username: 'test', hasPaid: true } } };
		const next = function(err) {
			expect(err).toBeFalsy();
		};
		ensurePaidUserOrAdmin(req, res, next);
	});
	test('works: paid user', function() {
		expect.assertions(1);
		const req = { params: { username: 'test' } };
		const res = { locals: { user: { admin: 'test', isApproved: true } } };
		const next = function(err) {
			expect(err).toBeFalsy();
		};
		ensurePaidUserOrAdmin(req, res, next);
	});
	test('unauth: admin token but not approved', function() {
		expect.assertions(1);
		const req = { params: { username: 'test' } };
		const res = { locals: { user: { admin: 'test', isApproved: false } } };
		const next = function(err) {
			expect(err instanceof UnauthorizedError).toBeTruthy();
		};
		ensurePaidUserOrAdmin(req, res, next);
	});

	test('unauth: user who has not paid..same param or not', function() {
		expect.assertions(1);
		const req = { params: { username: 'test' } };
		const res = { locals: { user: { username: 'test', hasPaid: false } } };
		const next = function(err) {
			expect(err instanceof UnauthorizedError).toBeTruthy();
		};
		ensurePaidUserOrAdmin(req, res, next);
	});

	test('unauth: if anon', function() {
		expect.assertions(1);
		const req = { params: { username: 'test' } };
		const res = { locals: {} };
		const next = function(err) {
			expect(err instanceof UnauthorizedError).toBeTruthy();
		};
		ensureCorrectUserOrAdmin(req, res, next);
	});
});
