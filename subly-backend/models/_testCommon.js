const bcrypt = require('bcrypt');

const db = require('../db.js');
const { BCRYPT_WORK_FACTOR } = require('../config');

const testProductIds = [];

async function commonBeforeAll() {
	// noinspection SqlWithoutWhere
	await db.query('DELETE FROM users');
	// noinspection SqlWithoutWhere
	await db.query('DELETE FROM admins');
	// noinspection SqlWithoutWhere
	await db.query('DELETE FROM products');

	const resultsProducts = await db.query(`
    INSERT INTO products (title, price, description, image_url)
    VALUES ('Product1', 100, 'this is desription #1', 'http://p1.img'),
           ('Product2', 200, 'this is desription #2', 'http://p2.img'),
           ('Product3', 300, 'this is desription #3', 'http://p3.img'),
           ('Product4', 400, 'this is desription #4', NULL)
    RETURNING id`);
	testProductIds.splice(0, 0, ...resultsProducts.rows.map((r) => r.id));

	await db.query(
		`
        INSERT INTO users(username,
                          password,
                          first_name,
                          last_name,
                          email,
                          image_url)
        VALUES ('u1', $1, 'U1F', 'U1L', 'u1@email.com', 'http://u1.img'),
               ('u2', $2, 'U2F', 'U2L', 'u2@email.com', NULL)
        RETURNING username`,
		[ await bcrypt.hash('password1', BCRYPT_WORK_FACTOR), await bcrypt.hash('password2', BCRYPT_WORK_FACTOR) ]
	);

	await db.query(
		`
        INSERT INTO admins(username,
                          password,
                          first_name,
                          last_name,
                          email,
                          image_url)
        VALUES ('a1', $1, 'A1F', 'A1L', 'a1@email.com', 'http://a1.img'),
               ('a2', $2, 'A2F', 'A2L', 'a2@email.com', NULL)
        RETURNING username`,
		[ await bcrypt.hash('password1', BCRYPT_WORK_FACTOR), await bcrypt.hash('password2', BCRYPT_WORK_FACTOR) ]
	);

	await db.query(
		`
        INSERT INTO subscriptions(username, product_id)
        VALUES ('u1', $1)`,
		[ testProductIds[0] ]
	);
}

async function commonBeforeEach() {
	await db.query('BEGIN');
}

async function commonAfterEach() {
	await db.query('ROLLBACK');
}

async function commonAfterAll() {
	await db.end();
}

module.exports = {
	commonBeforeAll,
	commonBeforeEach,
	commonAfterEach,
	commonAfterAll,
	testProductIds
};
