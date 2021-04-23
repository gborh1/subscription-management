'use strict';

const db = require('../db.js');
const User = require('../models/user');
const Admin = require('../models/admin');
const Product = require('../models/product');
const { createUserToken, createAdminToken } = require('../helpers/tokens');

const testProductIds = [];

async function commonBeforeAll() {
	// noinspection SqlWithoutWhere
	await db.query('DELETE FROM users');
	// noinspection SqlWithoutWhere
	await db.query('DELETE FROM admins');
	// noinspection SqlWithoutWhere
	await db.query('DELETE FROM products');

	testProductIds[0] = (await Product.create({
		title       : 'P1',
		price       : 100,
		description : 'this is desription #1',
		imageUrl    : 'http://p1.img'
	})).id;
	testProductIds[1] = (await Product.create({
		title       : 'P2',
		price       : 200,
		description : 'this is desription #2',
		imageUrl    : 'http://p1.img'
	})).id;
	testProductIds[2] = (await Product.create({
		title       : 'P3',
		price       : 300,
		description : 'this is desription #3' /**no input for image  */
	})).id;

	await User.register({
		username  : 'u1',
		firstName : 'U1F',
		lastName  : 'U1L',
		email     : 'user1@user.com',
		password  : 'password1',
		hasPaid   : true
	});
	await User.register({
		username  : 'u2',
		firstName : 'U2F',
		lastName  : 'U2L',
		email     : 'user2@user.com',
		password  : 'password2',
		hasPaid   : false
	});
	await User.register({
		username  : 'u3',
		firstName : 'U3F',
		lastName  : 'U3L',
		email     : 'user3@user.com',
		password  : 'password3',
		hasPaid   : false
	});
	await Admin.register({
		username   : 'a1',
		firstName  : 'A1F',
		lastName   : 'A1L',
		email      : 'admin1@admin.com',
		password   : 'password1',
		isApproved : true
	});
	await Admin.register({
		username   : 'a2',
		firstName  : 'A2F',
		lastName   : 'A2L',
		email      : 'admin2@admin.com',
		password   : 'password2',
		isApproved : false
	});
	await Admin.register({
		username   : 'a3',
		firstName  : 'A3F',
		lastName   : 'A3L',
		email      : 'admin3@admin.com',
		password   : 'password3',
		isApproved : false
	});

	await User.subscribeToProduct('u1', testProductIds[0]);
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

const u1Token = createUserToken({ username: 'u1', hasPaid: true });
const u2Token = createUserToken({ username: 'u2', hasPaid: false });
const u3Token = createUserToken({ username: 'u3', hasPaid: false });
const A1Token = createAdminToken({ admin: 'admin', isApproved: false });
const A2Token = createAdminToken({ admin: 'admin', isApproved: true });

module.exports = {
	commonBeforeAll,
	commonBeforeEach,
	commonAfterEach,
	commonAfterAll,
	testProductIds,
	u1Token,
	u2Token,
	u3Token,
	A1Token,
	A2Token
};
