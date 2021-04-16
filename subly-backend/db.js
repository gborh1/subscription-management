'use strict';

/** Database setup for jobly. */

const { Client } = require('pg');
const { getDatabaseUri } = require('./config');

const ssl = process.env.DATABASE_URL
	? {
			ssl : {
				rejectUnauthorized : false
			}
		}
	: null;

const db = new Client({
	connectionString : getDatabaseUri(),
	...ssl
});

db.connect();

module.exports = db;
