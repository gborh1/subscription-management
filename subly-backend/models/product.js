'use strict';

const db = require('../db');
const { NotFoundError } = require('../expressError');
const { sqlForPartialUpdate } = require('../helpers/sql');

/** Related functions for products */

class Product {
	/** Create a product (from data), update db, return new product data.
   *
   * data should be { title, price, description, imageUrl}
   *
   * Returns { id, title, price, description, imageUrl}
   **/

	static async create(data) {
		const result = await db.query(
			`INSERT INTO products (title,
                             price,
                             description,
                             image_url)
           VALUES ($1, $2, $3, $4)
           RETURNING id, title, price, description, image_url AS "imageUrl"`,
			[ data.title, data.price, data.description, data.imageUrl ]
		);
		let product = result.rows[0];

		return product;
	}

	/** Find all products (optional filter on searchFilters).
   *
   * searchFilters (all optional):
   * - maxPrice
   * - description (will find case-insensitive, partial matches)
   * - title (will find case-insensitive, partial matches)
   *
   * Returns [{ id, title, price, description, imageUrl}, ...]
   * */

	static async findAll({ maxPrice, description, title } = {}) {
		let query = `SELECT p.id,
                        p.title,
                        p.price,
                        p.description,
                        p.image_url AS "imageUrl"
                 FROM products p`;
		let whereExpressions = [];
		let queryValues = [];

		// For each possible search term, add to whereExpressions and
		// queryValues so we can generate the right SQL

		if (maxPrice !== undefined) {
			queryValues.push(maxPrice);
			whereExpressions.push(`price <= $${queryValues.length}`);
		}

		if (description !== undefined) {
			queryValues.push(`%${description}%`);
			whereExpressions.push(`description ILIKE $${queryValues.length}`);
		}

		if (title !== undefined) {
			queryValues.push(`%${title}%`);
			whereExpressions.push(`title ILIKE $${queryValues.length}`);
		}

		if (whereExpressions.length > 0) {
			query += ' WHERE ' + whereExpressions.join(' AND ');
		}

		// Finalize query and return results

		query += ' ORDER BY title';
		const productsRes = await db.query(query, queryValues);
		return productsRes.rows;
	}

	/** Given a product id, return data about product.
   *
   * Returns { id, title, price, description, imageUrl}
   *
   * Throws NotFoundError if not found.
   **/

	static async get(id) {
		const productRes = await db.query(
			`SELECT id,
                  title,
                  price,
                  description,
                  image_url AS "imageUrl"
           FROM products
           WHERE id = $1`,
			[ id ]
		);

		const product = productRes.rows[0];

		if (!product) throw new NotFoundError(`No product: ${id}`);

		return product;
	}

	/** Update product data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain
   * all the fields; this only changes provided ones.
   *
   * Data can include: { title, price, description }
   *
   * Returns { id, title, price, description, imageUrl}
   *
   * Throws NotFoundError if not found.
   */

	static async update(id, data) {
		const { setCols, values } = sqlForPartialUpdate(data, {});
		const idVarIdx = '$' + (values.length + 1);

		const querySql = `UPDATE products 
                      SET ${setCols} 
                      WHERE id = ${idVarIdx} 
                      RETURNING id, 
                                title, 
                                price, 
                                description,
                                image_url AS "imageUrl"`;
		const result = await db.query(querySql, [ ...values, id ]);
		const product = result.rows[0];

		if (!product) throw new NotFoundError(`No product: ${id}`);

		return product;
	}

	/** Delete given product from database; returns undefined.
   *
   * Throws NotFoundError if company not found.
   **/

	static async remove(id) {
		const result = await db.query(
			`DELETE
           FROM products
           WHERE id = $1
           RETURNING id`,
			[ id ]
		);
		const product = result.rows[0];

		if (!product) throw new NotFoundError(`No product: ${id}`);
	}
}

module.exports = Product;
