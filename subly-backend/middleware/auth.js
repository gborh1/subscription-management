'use strict';

/** Convenience middleware to handle common auth cases in routes. */

const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../config');
const { UnauthorizedError } = require('../expressError');

/** Middleware: Authenticate user.
 *
 * If a token was provided, verify it, and, if valid, store the token payload
 * on res.locals (this will include the username and hasPaid field in case of user; admin and isApproved in case of admin.)
 *
 * It's not an error if no token was provided or if the token is not valid.
 */

function authenticateJWT(req, res, next) {
	try {
		const authHeader = req.headers && req.headers.authorization;
		if (authHeader) {
			const token = authHeader.replace(/^[Bb]earer /, '').trim();
			res.locals.user = jwt.verify(token, SECRET_KEY);
		}
		return next();
	} catch (err) {
		return next();
	}
}

/** Middleware to use when user must be logged in.
 *
 * If not, raises Unauthorized.
 */

function ensureUserLoggedIn(req, res, next) {
	try {
		if (!res.locals.user || !res.locals.user.username) throw new UnauthorizedError();
		return next();
	} catch (err) {
		return next(err);
	}
}

/** Middleware to use when admin must be logged in.
 *
 * If not, raises Unauthorized.
 */

function ensureAdmin(req, res, next) {
	try {
		if (!res.locals.user || !res.locals.user.admin) throw new UnauthorizedError();
		return next();
	} catch (err) {
		return next(err);
	}
}

/** Middleware to use to ensure user has paid.
 *
 *  If not, raises Unauthorized.
 */

function ensureUserHasPaid(req, res, next) {
	try {
		if (!res.locals.user || !res.locals.user.hasPaid) {
			throw new UnauthorizedError();
		}
		return next();
	} catch (err) {
		return next(err);
	}
}
/** Middleware to use to ensure admin is approved.
 *
 *  If not, raises Unauthorized.
 */

function ensureAdminIsApproved(req, res, next) {
	try {
		if (!res.locals.user || !res.locals.user.isApproved) {
			throw new UnauthorizedError();
		}
		return next();
	} catch (err) {
		return next(err);
	}
}

/** Middleware to use when they must provide a valid token & be user matching
 *  username provided as route param. Or user must be an Approved admin. 
 *
 *  If not, raises Unauthorized.
 */

function ensureCorrectUserOrAdmin(req, res, next) {
	try {
		const user = res.locals.user;
		if (!(user && (user.isApproved || user.username === req.params.username))) {
			throw new UnauthorizedError();
		}
		return next();
	} catch (err) {
		return next(err);
	}
}
/** Middleware to use when they must provide a valid token & be a paid user matching
 *  username provided as route param. Or user must be an Approved admin. 
 *
 *  If not, raises Unauthorized.
 */

function ensureCorrectPaidUserOrAdmin(req, res, next) {
	try {
		const user = res.locals.user;
		if (!(user && (user.isApproved || (user.username === req.params.username && user.hasPaid)))) {
			throw new UnauthorizedError();
		}
		return next();
	} catch (err) {
		return next(err);
	}
}
/** Middleware to use when they must provide a valid token & be a paid user Or user must be an Approved admin. 
 *
 *  If not, raises Unauthorized.
 */

function ensurePaidUserOrAdmin(req, res, next) {
	try {
		const user = res.locals.user;
		if (!(user && (user.isApproved || user.hasPaid))) {
			throw new UnauthorizedError();
		}
		return next();
	} catch (err) {
		return next(err);
	}
}

module.exports = {
	authenticateJWT,
	ensureUserLoggedIn,
	ensureAdmin,
	ensureUserHasPaid,
	ensureAdminIsApproved,
	ensureCorrectUserOrAdmin,
	ensurePaidUserOrAdmin,
	ensureCorrectPaidUserOrAdmin
};
