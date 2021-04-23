'use strict';

/** Routes for admins. */

const jsonschema = require('jsonschema');

const express = require('express');
const { ensureAdminIsApproved } = require('../middleware/auth');
const { BadRequestError } = require('../expressError');
const Admin = require('../models/admin');
const { createAdminToken } = require('../helpers/tokens');
const adminNewSchema = require('../schemas/adminNew.json');
const adminUpdateSchema = require('../schemas/adminUpdate.json');
const superAdminUpdateSchema = require('../schemas/superAdminUpdate.json');

const router = express.Router();

/** POST / { admin }  => { admin, token }
 *
 * Adds a new admin. This is not the registration endpoint --- instead, this is
 * only for Approved admins to add new admins. 
 *
 * This returns the newly created admin and an authentication token for them:
 *  {admin: { username, firstName, lastName, email, isApproved}, token }
 *
 * Authorization required: approved admin
 **/

router.post('/', ensureAdminIsApproved, async function(req, res, next) {
	try {
		const validator = jsonschema.validate(req.body, adminNewSchema);
		if (!validator.valid) {
			const errs = validator.errors.map((e) => e.stack);
			throw new BadRequestError(errs);
		}

		const admin = await Admin.register(req.body);
		const token = createAdminToken(admin);
		return res.status(201).json({ admin, token });
	} catch (err) {
		return next(err);
	}
});

/** GET / => { admins: [ {username, firstName, lastName, email, isApproved, imageUrl }, ... ] }
 *
 * Returns list of all admins.
 *
 * Authorization required: approved admin
 **/

router.get('/', ensureAdminIsApproved, async function(req, res, next) {
	try {
		const admins = await Admin.findAll();
		return res.json({ admins });
	} catch (err) {
		return next(err);
	}
});

/** GET /[username] => { admin }
 *
 * Returns  { username, first_name, last_name, email, isApproved, image_URL}
 *  
 *
 * Authorization required: approved admin
 **/

router.get('/:username', ensureAdminIsApproved, async function(req, res, next) {
	try {
		const admin = await Admin.get(req.params.username);
		return res.json({ admin });
	} catch (err) {
		return next(err);
	}
});

/** PATCH /[username] { admin } => { admin }
 *
 * Data can include:
 *  { firstName, lastName, password, email, isApproved, image_url}
 *
 * Returns { username, firstName, lastName, email, isApproved, image_url}
 *
 * Authorization required: Approved Admin
 **/

router.patch('/:username', ensureAdminIsApproved, async function(req, res, next) {
	try {
		const validator = jsonschema.validate(req.body, adminUpdateSchema);
		if (!validator.valid) {
			const errs = validator.errors.map((e) => e.stack);
			throw new BadRequestError(errs);
		}

		const admin = await Admin.update(req.params.username, req.body);
		return res.json({ admin });
	} catch (err) {
		return next(err);
	}
});

/** DELETE /[username]  =>  { deleted: username }
 *
 * Authorization required: Approved admin 
 **/

router.delete('/:username', ensureAdminIsApproved, async function(req, res, next) {
	try {
		await Admin.remove(req.params.username);
		return res.json({ deleted: req.params.username });
	} catch (err) {
		return next(err);
	}
});

module.exports = router;
