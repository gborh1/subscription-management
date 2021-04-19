'use strict';

const db = require('../db');
const bcrypt = require('bcrypt');
const { sqlForPartialUpdate } = require('../helpers/sql');
const { NotFoundError, BadRequestError, UnauthorizedError } = require('../expressError');

const { BCRYPT_WORK_FACTOR } = require('../config.js');

/** Related functions for admins. */

class Admin {
	/** authenticate admin with username, password.
   *
   * Returns { username, first_name, last_name, email, is_approved, image_url }
   *
   * Throws UnauthorizedError if admin not found or wrong password.
   **/

	static async authenticate(username, password) {
		// try to find the admin first
		const result = await db.query(
			`SELECT username,
                  password,
                  first_name AS "firstName",
                  last_name AS "lastName",
                  email,
                  image_url as "imageUrl",
                  is_approved as "isApproved"
           FROM admins
           WHERE username = $1`,
			[ username ]
		);

		const admin = result.rows[0];

		if (admin) {
			// compare hashed password to a new hash from password
			const isValid = await bcrypt.compare(password, admin.password);
			if (isValid === true) {
				delete admin.password;
				return admin;
			}
		}

		throw new UnauthorizedError('Invalid username/password');
	}

	/** Register admin with data.
   *
   * Returns { username, first_name, last_name, email, is_approved}
   *
   * Throws BadRequestError on duplicates.
   **/

	static async register({ username, password, firstName, lastName, email, isApproved }) {
		const duplicateCheck = await db.query(
			`SELECT username
           FROM admins
           WHERE username = $1`,
			[ username ]
		);

		if (duplicateCheck.rows[0]) {
			throw new BadRequestError(`Duplicate username: ${username}`);
		}

		const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

		const result = await db.query(
			`INSERT INTO admins
           (username,
            password,
            first_name,
            last_name,
            email,
            is_approved)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING username, first_name AS "firstName", last_name AS "lastName", email, is_approved AS "isApproved"`,
			[ username, hashedPassword, firstName, lastName, email, isApproved ]
		);

		const admin = result.rows[0];

		return admin;
	}

	/** Find all admins.
   *
   * Returns [{ username, first_name, last_name, email, image_url, isApproved }, ...]
   **/

	static async findAll() {
		const result = await db.query(
			`SELECT username,
                  first_name AS "firstName",
                  last_name AS "lastName",
                  email,
                  image_url AS "imageUrl", 
                  is_approved AS "isApproved"
           FROM admins
           ORDER BY username`
		);

		return result.rows;
	}

	/** Given a username, return data about admin.
   *
   * Returns { username, first_name, last_name, image_URL, is_approved}
   * 
   *
   * Throws NotFoundError if admin not found.
   **/

	static async get(username) {
		const userRes = await db.query(
			`SELECT username,
                  first_name AS "firstName",
                  last_name AS "lastName",
                  email,
                  image_url AS "imageUrl",
                  is_approved AS "isApproved"
           FROM admins
           WHERE username = $1`,
			[ username ]
		);

		const admin = userRes.rows[0];

		if (!admin) throw new NotFoundError(`No admin: ${username}`);

		return admin;
	}

	/** Update admin data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain
   * all the fields; this only changes provided ones.
   *
   * Data can include:
   *   { firstName, lastName, password, email, image_url, is_approved}
   *
   * Returns { username, firstName, lastName, email, image_url, is_approved}
   *
   * Throws NotFoundError if not found.
   *
   * WARNING: this function can set a new password.
   * Callers of this function must be certain they have validated inputs to this
   * or a serious security risks are opened.
   */

	static async update(username, data) {
		if (data.password) {
			data.password = await bcrypt.hash(data.password, BCRYPT_WORK_FACTOR);
		}

		const { setCols, values } = sqlForPartialUpdate(data, {
			firstName  : 'first_name',
			lastName   : 'last_name',
			imageUrl   : 'image_url',
			isApproved : 'is_approved'
		});
		const usernameVarIdx = '$' + (values.length + 1);

		const querySql = `UPDATE admins 
                      SET ${setCols} 
                      WHERE username = ${usernameVarIdx} 
                      RETURNING username,
                                first_name AS "firstName",
                                last_name AS "lastName",
                                email,
                                image_url AS "imageUrl",
                                is_approved AS "isApproved"`;
		const result = await db.query(querySql, [ ...values, username ]);
		const admin = result.rows[0];

		if (!admin) throw new NotFoundError(`No admin: ${username}`);

		delete admin.password;
		return admin;
	}

	/** Delete given user from database; returns undefined. */

	static async remove(username) {
		let result = await db.query(
			`DELETE
           FROM admins
           WHERE username = $1
           RETURNING username`,
			[ username ]
		);
		const admin = result.rows[0];

		if (!admin) throw new NotFoundError(`No admin: ${username}`);
	}
}

module.exports = Admin;
