'use strict';

const db = require('../db');
const bcrypt = require('bcrypt');
const { sqlForPartialUpdate } = require('../helpers/sql');
const { NotFoundError, BadRequestError, UnauthorizedError } = require('../expressError');

const { BCRYPT_WORK_FACTOR } = require('../config.js');

/** Related functions for users. */

class User {
	/** authenticate user with username, password.
   *
   * Returns { username, first_name, last_name, email, has_paid, image_url }
   *
   * Throws UnauthorizedError if user not found or wrong password.
   **/

	static async authenticate(username, password) {
		// try to find the user first
		const result = await db.query(
			`SELECT username,
                  password,
                  first_name AS "firstName",
                  last_name AS "lastName",
                  email,
                  has_paid AS "hasPaid", 
                  image_url as "imageUrl"
           FROM users
           WHERE username = $1`,
			[ username ]
		);

		const user = result.rows[0];

		if (user) {
			// compare hashed password to a new hash from password
			const isValid = await bcrypt.compare(password, user.password);
			if (isValid === true) {
				delete user.password;
				return user;
			}
		}

		throw new UnauthorizedError('Invalid username/password');
	}

	/** Register user with data.
   *
   * Returns { username, first_name, last_name, email, has_paid}
   *
   * Throws BadRequestError on duplicates.
   **/

	static async register({ username, password, firstName, lastName, email, hasPaid }) {
		const duplicateCheck = await db.query(
			`SELECT username
           FROM users
           WHERE username = $1`,
			[ username ]
		);

		if (duplicateCheck.rows[0]) {
			throw new BadRequestError(`Duplicate username: ${username}`);
		}

		const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

		const result = await db.query(
			`INSERT INTO users
           (username,
            password,
            first_name,
            last_name,
            email,
            has_paid)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING username, first_name AS "firstName", last_name AS "lastName", email, has_paid AS "hasPaid"`,
			[ username, hashedPassword, firstName, lastName, email, hasPaid ]
		);

		const user = result.rows[0];

		return user;
	}

	/** Find all users.
   *
   * Returns [{ username, first_name, last_name, email, has_paid, image_url }, ...]
   **/

	static async findAll() {
		const result = await db.query(
			`SELECT username,
                  first_name AS "firstName",
                  last_name AS "lastName",
                  email,
                  has_paid AS "hasPaid",
                  image_url AS "imageUrl"
           FROM users
           ORDER BY username`
		);

		return result.rows;
	}

	/** Given a username, return data about user.
   *
   * Returns { username, first_name, last_name, has_paid, image_URL, subscriptions}
   *   where subscriptions is [product_id,... ]
   * 
   *
   * Throws NotFoundError if user not found.
   **/

	static async get(username) {
		const userRes = await db.query(
			`SELECT username,
                  first_name AS "firstName",
                  last_name AS "lastName",
                  email,
                  has_paid AS "hasPaid",
                  image_url AS "imageUrl"
           FROM users
           WHERE username = $1`,
			[ username ]
		);

		const user = userRes.rows[0];

		if (!user) throw new NotFoundError(`No user: ${username}`);

		const userSubscriptionsRes = await db.query(
			`SELECT s.product_id
           FROM subscriptions AS s
           WHERE s.username = $1`,
			[ username ]
		);

		user.subscriptions = userSubscriptionsRes.rows.map((s) => s.product_id);
		return user;
	}

	/** Update user data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain
   * all the fields; this only changes provided ones.
   *
   * Data can include:
   *   { firstName, lastName, password, email, has_paid, image_url}
   *
   * Returns { username, firstName, lastName, email, has_paid, image_url}
   *
   * Throws NotFoundError if not found.
   *
   * WARNING: this function can set a new password or set a user as having paid.
   * Callers of this function must be certain they have validated inputs to this
   * or a serious security risks are opened.
   */

	static async update(username, data) {
		if (data.password) {
			data.password = await bcrypt.hash(data.password, BCRYPT_WORK_FACTOR);
		}

		const { setCols, values } = sqlForPartialUpdate(data, {
			firstName : 'first_name',
			lastName  : 'last_name',
			hasPaid   : 'has_paid',
			imageUrl  : 'image_url'
		});
		const usernameVarIdx = '$' + (values.length + 1);

		const querySql = `UPDATE users 
                      SET ${setCols} 
                      WHERE username = ${usernameVarIdx} 
                      RETURNING username,
                                first_name AS "firstName",
                                last_name AS "lastName",
                                email,
                                has_paid AS "hasPaid",
                                image_url AS "imageUrl"`;
		const result = await db.query(querySql, [ ...values, username ]);
		const user = result.rows[0];

		if (!user) throw new NotFoundError(`No user: ${username}`);

		delete user.password;
		return user;
	}

	/** Delete given user from database; returns undefined. */

	static async remove(username) {
		let result = await db.query(
			`DELETE
           FROM users
           WHERE username = $1
           RETURNING username`,
			[ username ]
		);
		const user = result.rows[0];

		if (!user) throw new NotFoundError(`No user: ${username}`);
	}

	/** Subscribe user to product: update db, returns undefined.
   *
   * - username: username subscribing to product
   * - productId: product id
   **/

	static async subscribeToProduct(username, productId) {
		const preCheck = await db.query(
			`SELECT id
           FROM products
           WHERE id = $1`,
			[ productId ]
		);
		const product = preCheck.rows[0];

		if (!product) throw new NotFoundError(`No product: ${productId}`);

		const preCheck2 = await db.query(
			`SELECT username
           FROM users
           WHERE username = $1`,
			[ username ]
		);
		const user = preCheck2.rows[0];

		if (!user) throw new NotFoundError(`No username: ${username}`);

		await db.query(
			`INSERT INTO subscriptions (product_id, username)
           VALUES ($1, $2)`,
			[ productId, username ]
		);
	}

	/** Unsubscribe user from product: update db, returns undefined.
   *
   * - username: username subscribing to product
   * - productId: product id
   **/

	static async unsubscribeFromProduct(username, productId) {
		const preCheck = await db.query(
			`SELECT id
           FROM products
           WHERE id = $1`,
			[ productId ]
		);
		const product = preCheck.rows[0];

		if (!product) throw new NotFoundError(`No product: ${productId}`);

		const preCheck2 = await db.query(
			`SELECT username
           FROM users
           WHERE username = $1`,
			[ username ]
		);
		const user = preCheck2.rows[0];

		if (!user) throw new NotFoundError(`No username: ${username}`);

		await db.query(`DELETE FROM subscriptions WHERE username= $1 and product_id = $2`, [ username, productId ]);
	}
}

module.exports = User;
