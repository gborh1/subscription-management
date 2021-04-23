'use strict';

/** Routes for products. */

const jsonschema = require('jsonschema');

const express = require('express');
const { BadRequestError } = require('../expressError');
const { ensureAdminIsApproved, ensureCorrectUserOrAdmin, ensurePaidUserOrAdmin } = require('../middleware/auth');
const Product = require('../models/product');
const productNewSchema = require('../schemas/productNew.json');
const productUpdateSchema = require('../schemas/productUpdate.json');
const productSearchSchema = require('../schemas/productSearch.json');

const router = express.Router({ mergeParams: true });

/** POST / { product } => { product }
 *
 * product should be { title, price, description, imageUrl}
 *
 * Returns { title, price, description, imageUrl}
 *
 * Authorization required: Approved admin
 */

router.post('/', ensureAdminIsApproved, async function(req, res, next) {
	try {
		const validator = jsonschema.validate(req.body, productNewSchema);
		if (!validator.valid) {
			const errs = validator.errors.map((e) => e.stack);
			throw new BadRequestError(errs);
		}

		const product = await Product.create(req.body);
		return res.status(201).json({ product });
	} catch (err) {
		return next(err);
	}
});

/** GET / =>
 *   { products: [ {id,  title, price, description, imageUrl}, ...] }
 *
 * Can provide search filter in query:
 * - maxPrice
 * - description (will find case-insensitive, partial matches)
 * - title (will find case-insensitive, partial matches)

 * Authorization required: Approved Admin or paid user
 */

router.get('/', ensurePaidUserOrAdmin, async function(req, res, next) {
	const q = req.query;
	// arrive as strings from querystring, but we want as int/bool
	if (q.maxPrice !== undefined) q.maxPrice = +q.maxPrice;

	try {
		const validator = jsonschema.validate(q, productSearchSchema);
		if (!validator.valid) {
			const errs = validator.errors.map((e) => e.stack);
			throw new BadRequestError(errs);
		}

		const products = await Product.findAll(q);
		return res.json({ products });
	} catch (err) {
		return next(err);
	}
});

/** GET /[productId] => { product }
 *
 * Returns {id,  title, price, description, imageUrl}
 *
 * Authorization required: Approved Admin or paid user
 */

router.get('/:id', ensurePaidUserOrAdmin, async function(req, res, next) {
	try {
		const product = await Product.get(req.params.id);
		return res.json({ product });
	} catch (err) {
		return next(err);
	}
});

/** PATCH /[productId]  { fld1, fld2, ... } => { product }
 *
 * Data can include: {title, price, description, imageUrl}
 *
 * Returns {id,  title, price, description, imageUrl}
 *
 * Authorization required: approved admin
 */

router.patch('/:id', ensureAdminIsApproved, async function(req, res, next) {
	try {
		const validator = jsonschema.validate(req.body, productUpdateSchema);
		if (!validator.valid) {
			const errs = validator.errors.map((e) => e.stack);
			throw new BadRequestError(errs);
		}

		const product = await Product.update(req.params.id, req.body);
		return res.json({ product });
	} catch (err) {
		return next(err);
	}
});

/** DELETE /[handle]  =>  { deleted: id }
 *
 * Authorization required: approved admin
 */

router.delete('/:id', ensureAdminIsApproved, async function(req, res, next) {
	try {
		await Product.remove(req.params.id);
		return res.json({ deleted: +req.params.id });
	} catch (err) {
		return next(err);
	}
});

module.exports = router;
