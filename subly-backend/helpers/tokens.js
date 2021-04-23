const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../config');

/** return signed JWT from user data. */

function createUserToken(user) {
	console.assert(user.hasPaid !== undefined, 'createUserToken passed user without hasPaid property');

	let payload = {
		username : user.username,
		hasPaid  : user.hasPaid || false
	};

	return jwt.sign(payload, SECRET_KEY);
}

function createAdminToken(admin) {
	let payload = {
		admin      : admin.username,
		isApproved : admin.isApproved || false
	};

	return jwt.sign(payload, SECRET_KEY);
}

module.exports = { createUserToken, createAdminToken };
