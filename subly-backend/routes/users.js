'use strict';

/** Routes for users. */

const jsonschema = require('jsonschema');

const express = require('express');
const {
	ensureCorrectUserOrAdmin,
	ensureUserHasPaid,
	ensureAdminIsApproved,
	ensureCorrectPaidUserOrAdmin
} = require('../middleware/auth');
const { BadRequestError } = require('../expressError');
const User = require('../models/user');
const { createUserToken } = require('../helpers/tokens');
const userNewSchema = require('../schemas/userNew.json');
const userUpdateSchema = require('../schemas/userUpdate.json');
const userAdminUpdateSchema = require('../schemas/userAdminUpdate.json');

const router = express.Router();

/** POST / { user }  => { user, token }
 *
 * Adds a new user. This is not the registration endpoint --- instead, this is
 * only for admin users to add new users. The new user being added can be an
 * admin.
 *
 * This returns the newly created user and an authentication token for them:
 *  {user: { username, firstName, lastName, email, hasPaid }, token }
 *
 * Authorization required: approved admin
 **/

router.post('/', ensureAdminIsApproved, async function(req, res, next) {
	try {
		const validator = jsonschema.validate(req.body, userNewSchema);
		if (!validator.valid) {
			const errs = validator.errors.map((e) => e.stack);
			throw new BadRequestError(errs);
		}

		const user = await User.register(req.body);
		const token = createUserToken(user);
		return res.status(201).json({ user, token });
	} catch (err) {
		return next(err);
	}
});

/** GET / => { users: [ {username, firstName, lastName, email, hasPaid, imageUrl }, ... ] }
 *
 * Returns list of all users.
 *
 * Authorization required: approved admin
 **/

router.get('/', ensureAdminIsApproved, async function(req, res, next) {
	try {
		const users = await User.findAll();
		return res.json({ users });
	} catch (err) {
		return next(err);
	}
});

/** GET /[username] => { user, token }
 *
 * Returns  { username, first_name, last_name, has_paid, image_URL, subscriptions}
 *   where subscriptions is [product_id,... ]
 *
 * Authorization required: approved admin or same user-as-:username
 **/

router.get('/:username', ensureCorrectUserOrAdmin, async function(req, res, next) {
	try {
		const user = await User.get(req.params.username);
		const token = createUserToken(user);
		return res.json({ user, token });
	} catch (err) {
		return next(err);
	}
});

/** PATCH /[username] { user } => { user }
 *
 * Data can include:
 *   { firstName, lastName, password, email, imageUrl, hasPaid } 
 *
 * Returns { username, firstName, lastName, hasPaid, imageUrl}
 *
 * Authorization required: Approved admin or same-user-as-:username
 **/

router.patch('/:username', ensureCorrectUserOrAdmin, async function(req, res, next) {
	try {
		const validator = jsonschema.validate(req.body, userUpdateSchema);
		if (!validator.valid) {
			const errs = validator.errors.map((e) => e.stack);
			throw new BadRequestError(errs);
		}

		const user = await User.update(req.params.username, req.body);
		return res.json({ user });
	} catch (err) {
		return next(err);
	}
});

/** PATCH /[username] { user } => { user }
 *
 * Data can include:
 *  { firstName, lastName, password, email, has_paid, image_url}
 *
 * Returns { username, firstName, lastName, has_paid, image_url}
 *
 * Authorization required: Approved Admin
 * 
 * This route is specifically designed for admin to be able to change sensitive parts of user's account. EX: has_paid status. 
 **/

router.patch('/:username/admin', ensureAdminIsApproved, async function(req, res, next) {
	try {
		const validator = jsonschema.validate(req.body, userAdminUpdateSchema);
		if (!validator.valid) {
			const errs = validator.errors.map((e) => e.stack);
			throw new BadRequestError(errs);
		}

		const user = await User.update(req.params.username, req.body);
		return res.json({ user });
	} catch (err) {
		return next(err);
	}
});

/** DELETE /[username]  =>  { deleted: username }
 *
 * Authorization required: Approved admin or PAID same-user-as-:username
 **/

router.delete('/:username', ensureCorrectPaidUserOrAdmin, async function(req, res, next) {
	try {
		await User.remove(req.params.username);
		return res.json({ deleted: req.params.username });
	} catch (err) {
		return next(err);
	}
});

/** POST /[username]/products/[id]  { state } => { subscription }
 *
 * Returns {"subscribed": productId}
 *
 * Authorization required: Approved admin or PAID same-user-as-:username
 * */

router.post('/:username/products/:id', ensureCorrectPaidUserOrAdmin, async function(req, res, next) {
	try {
		const productId = +req.params.id;
		await User.subscribeToProduct(req.params.username, productId);
		return res.json({ subscribed: productId });
	} catch (err) {
		return next(err);
	}
});

/** DELETE /[username]/products/[id]  { state } => { unsubscribed }
 *
 * Returns {"unsubscribed": productId}
 *
 * Authorization required: Approved admin or PAID same-user-as-:username
 * */

router.delete('/:username/products/:id', ensureCorrectPaidUserOrAdmin, async function(req, res, next) {
	try {
		const productId = +req.params.id;
		await User.unsubscribeFromProduct(req.params.username, productId);
		return res.json({ unsubscribed: productId });
	} catch (err) {
		return next(err);
	}
});

module.exports = router;
