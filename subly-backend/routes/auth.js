'use strict';

/** Routes for authentication. */

const jsonschema = require('jsonschema');

const User = require('../models/user');
const Admin = require('../models/admin');
const express = require('express');
const router = new express.Router();
const { createUserToken, createAdminToken } = require('../helpers/tokens');
const userAuthSchema = require('../schemas/userAuth.json');
const adminAuthSchema = require('../schemas/adminAuth.json');
const userRegisterSchema = require('../schemas/userRegister.json');
const adminRegisterSchema = require('../schemas/adminRegister.json');
const { BadRequestError } = require('../expressError');

/** POST /auth/userToken:  { username, password } => { token }
 *
 * Returns JWT token which can be used to authenticate further requests.
 *
 * Authorization required: none
 */

router.post('/userToken', async function(req, res, next) {
	try {
		const validator = jsonschema.validate(req.body, userAuthSchema);
		if (!validator.valid) {
			const errs = validator.errors.map((e) => e.stack);
			throw new BadRequestError(errs);
		}

		const { username, password } = req.body;
		const user = await User.authenticate(username, password);
		const token = createUserToken(user);
		return res.json({ token });
	} catch (err) {
		return next(err);
	}
});

/** POST /auth/adminToken:  { username, password } => { token }
 *
 * Returns JWT token which can be used to authenticate further requests.
 *
 * Authorization required: none
 */

router.post('/adminToken', async function(req, res, next) {
	try {
		const validator = jsonschema.validate(req.body, adminAuthSchema);
		if (!validator.valid) {
			const errs = validator.errors.map((e) => e.stack);
			throw new BadRequestError(errs);
		}

		const { username, password } = req.body;
		const admin = await Admin.authenticate(username, password);
		const token = createAdminToken(admin);
		return res.json({ token });
	} catch (err) {
		return next(err);
	}
});

/** POST /auth/userRegister:   { user } => { token }
 *
 * user must include { username, password, firstName, lastName, email }
 *
 * Returns JWT token which can be used to authenticate further requests.
 *
 * Authorization required: none
 */

router.post('/userRegister', async function(req, res, next) {
	try {
		const validator = jsonschema.validate(req.body, userRegisterSchema);
		if (!validator.valid) {
			const errs = validator.errors.map((e) => e.stack);
			throw new BadRequestError(errs);
		}

		const newUser = await User.register({ ...req.body, hasPaid: false });
		const token = createUserToken(newUser);
		return res.status(201).json({ token });
	} catch (err) {
		return next(err);
	}
});

/** POST /auth/adminRegister:   { admin} => { token }
 *
 * admin must include { username, password, firstName, lastName, email }
 *
 * Returns JWT token which can be used to authenticate further requests.
 *
 * Authorization required: none
 * 
 * Note: For security reasons, this route must be protected. Holders of this type of registration will have access to every route. 
 * Another option is to put an "isSuper" column in db, that must be confirmed before this user can see everything. 
 */

router.post('/adminRegister', async function(req, res, next) {
	try {
		const validator = jsonschema.validate(req.body, adminRegisterSchema);
		if (!validator.valid) {
			const errs = validator.errors.map((e) => e.stack);
			throw new BadRequestError(errs);
		}

		const newAdmin = await Admin.register({ ...req.body });
		const token = createAdminToken(newAdmin);
		return res.status(201).json({ token });
	} catch (err) {
		return next(err);
	}
});

module.exports = router;
