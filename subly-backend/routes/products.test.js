'use strict';

const request = require('supertest');

const app = require('../app');

const {
	commonBeforeAll,
	commonBeforeEach,
	commonAfterEach,
	commonAfterAll,
	testProductIds,
	u1Token,
	u2Token,
	A2Token,
	A1Token
} = require('./_testCommon');

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /products */

describe('POST /products', function() {
	test('ok for approved admin', async function() {
		const resp = await request(app)
			.post(`/products`)
			.send({
				title       : 'P-new',
				price       : 10,
				description : 'this is new desription',
				imageUrl    : 'http://newP.img'
			})
			.set('authorization', `Bearer ${A2Token}`);
		expect(resp.statusCode).toEqual(201);
		expect(resp.body).toEqual({
			product : {
				id          : expect.any(Number),
				title       : 'P-new',
				price       : 10,
				description : 'this is new desription',
				imageUrl    : 'http://newP.img'
			}
		});
	});
	test('works missing an image', async function() {
		const resp = await request(app)
			.post(`/products`)
			.send({
				title       : 'P-new',
				price       : 10,
				description : 'this is new desription'
			})
			.set('authorization', `Bearer ${A2Token}`);
		expect(resp.statusCode).toEqual(201);
		expect(resp.body).toEqual({
			product : {
				id          : expect.any(Number),
				title       : 'P-new',
				price       : 10,
				description : 'this is new desription',
				imageUrl    : null
			}
		});
	});

	test('unauth for users', async function() {
		const resp = await request(app)
			.post(`/products`)
			.send({
				title       : 'P-new',
				price       : 10,
				description : 'this is new desription',
				imageUrl    : 'http://newP.img'
			})
			.set('authorization', `Bearer ${u1Token}`);
		expect(resp.statusCode).toEqual(401);
	});

	test('unauth for unapproved admin', async function() {
		const resp = await request(app)
			.post(`/products`)
			.send({
				title       : 'P-new',
				price       : 10,
				description : 'this is new desription',
				imageUrl    : 'http://newP.img'
			})
			.set('authorization', `Bearer ${A1Token}`);
		expect(resp.statusCode).toEqual(401);
	});

	test('bad request with missing data', async function() {
		const resp = await request(app)
			.post(`/products`)
			.send({
				title : 'P-new'
			})
			.set('authorization', `Bearer ${A2Token}`);
		expect(resp.statusCode).toEqual(400);
	});

	test('bad request with invalid data', async function() {
		const resp = await request(app)
			.post(`/products`)
			.send({
				title       : 'P-new',
				price       : 'not a number',
				description : 'this is new desription',
				imageUrl    : 'http://newP.img'
			})
			.set('authorization', `Bearer ${A2Token}`);
		expect(resp.statusCode).toEqual(400);
	});
});

/************************************** GET /products */

describe('GET /products', function() {
	test('ok for approved admin', async function() {
		const resp = await request(app).get(`/products`).set('authorization', `Bearer ${A2Token}`);
		expect(resp.body).toEqual({
			products : [
				{
					id          : expect.any(Number),
					title       : 'P1',
					price       : 100,
					description : 'this is desription #1',
					imageUrl    : 'http://p1.img'
				},
				{
					id          : expect.any(Number),
					title       : 'P2',
					price       : 200,
					description : 'this is desription #2',
					imageUrl    : 'http://p1.img'
				},
				{
					id          : expect.any(Number),
					title       : 'P3',
					price       : 300,
					description : 'this is desription #3',
					imageUrl    : null
				}
			]
		});
	});
	test('OK for paid user', async function() {
		const resp = await request(app).get(`/products`).set('authorization', `Bearer ${u1Token}`);
		expect(resp.body).toEqual({
			products : [
				{
					id          : expect.any(Number),
					title       : 'P1',
					price       : 100,
					description : 'this is desription #1',
					imageUrl    : 'http://p1.img'
				},
				{
					id          : expect.any(Number),
					title       : 'P2',
					price       : 200,
					description : 'this is desription #2',
					imageUrl    : 'http://p1.img'
				},
				{
					id          : expect.any(Number),
					title       : 'P3',
					price       : 300,
					description : 'this is desription #3',
					imageUrl    : null
				}
			]
		});
	});
	test('unauth for unpaid users', async function() {
		const resp = await request(app).get(`/products`).set('authorization', `Bearer ${u2Token}`);

		expect(resp.statusCode).toEqual(401);
	});

	test('unauth for unapproved admin', async function() {
		const resp = await request(app).get(`/products`).set('authorization', `Bearer ${A1Token}`);
		expect(resp.statusCode).toEqual(401);
	});

	test('works: filtering max price', async function() {
		const resp = await request(app)
			.get(`/products`)
			.query({ maxPrice: 200 })
			.set('authorization', `Bearer ${A2Token}`);
		expect(resp.body).toEqual({
			products : [
				{
					id          : expect.any(Number),
					title       : 'P1',
					price       : 100,
					description : 'this is desription #1',
					imageUrl    : 'http://p1.img'
				},
				{
					id          : expect.any(Number),
					title       : 'P2',
					price       : 200,
					description : 'this is desription #2',
					imageUrl    : 'http://p1.img'
				}
			]
		});
	});

	test('works: filtering on 2 filters -- max price, description', async function() {
		const resp = await request(app)
			.get(`/products`)
			.query({ maxPrice: 200, description: '#1' })
			.set('authorization', `Bearer ${A2Token}`);
		expect(resp.body).toEqual({
			products : [
				{
					id          : expect.any(Number),
					title       : 'P1',
					price       : 100,
					description : 'this is desription #1',
					imageUrl    : 'http://p1.img'
				}
			]
		});
	});
	test('works: filtering on 2 filters -- max price, title', async function() {
		const resp = await request(app)
			.get(`/products`)
			.query({ maxPrice: 200, title: 'p2' })
			.set('authorization', `Bearer ${A2Token}`);
		expect(resp.body).toEqual({
			products : [
				{
					id          : expect.any(Number),
					title       : 'P2',
					price       : 200,
					description : 'this is desription #2',
					imageUrl    : 'http://p1.img'
				}
			]
		});
	});

	test('bad request on invalid filter key', async function() {
		const resp = await request(app)
			.get(`/products`)
			.query({ minSalary: 2, nope: 'nope' })
			.set('authorization', `Bearer ${A2Token}`);
		expect(resp.statusCode).toEqual(400);
	});
});

/************************************** GET /products/:id */

describe('GET /products/:id', function() {
	test('works for approved admin', async function() {
		const resp = await request(app).get(`/products/${testProductIds[0]}`).set('authorization', `Bearer ${A2Token}`);
		expect(resp.body).toEqual({
			product : {
				id          : expect.any(Number),
				title       : 'P1',
				price       : 100,
				description : 'this is desription #1',
				imageUrl    : 'http://p1.img'
			}
		});
	});
	test('works for paid user', async function() {
		const resp = await request(app).get(`/products/${testProductIds[0]}`).set('authorization', `Bearer ${u1Token}`);
		expect(resp.body).toEqual({
			product : {
				id          : expect.any(Number),
				title       : 'P1',
				price       : 100,
				description : 'this is desription #1',
				imageUrl    : 'http://p1.img'
			}
		});
	});
	test('unauth for unpaid user', async function() {
		const resp = await request(app).get(`/products/${testProductIds[0]}`).set('authorization', `Bearer ${u2Token}`);
		expect(resp.statusCode).toEqual(401);
	});
	test('unauth for unapproved admin', async function() {
		const resp = await request(app).get(`/products/${testProductIds[0]}`).set('authorization', `Bearer ${A1Token}`);
		expect(resp.statusCode).toEqual(401);
	});
	test('unauth for anon', async function() {
		const resp = await request(app).get(`/products/${testProductIds[0]}`);
		expect(resp.statusCode).toEqual(401);
	});

	test('not found for no such product', async function() {
		const resp = await request(app).get(`/products/0`).set('authorization', `Bearer ${A2Token}`);
		expect(resp.statusCode).toEqual(404);
	});
});

/************************************** PATCH /products/:id */

describe('PATCH /products/:id', function() {
	test('works for approved admin', async function() {
		const resp = await request(app)
			.patch(`/products/${testProductIds[0]}`)
			.send({
				title : 'P-New'
			})
			.set('authorization', `Bearer ${A2Token}`);
		expect(resp.body).toEqual({
			product : {
				id          : expect.any(Number),
				title       : 'P-New',
				price       : 100,
				description : 'this is desription #1',
				imageUrl    : 'http://p1.img'
			}
		});
	});

	test('unauth for unapproved Admins', async function() {
		const resp = await request(app)
			.patch(`/products/${testProductIds[0]}`)
			.send({
				title : 'P-New'
			})
			.set('authorization', `Bearer ${A1Token}`);
		expect(resp.statusCode).toEqual(401);
	});
	test('unauth for users', async function() {
		const resp = await request(app)
			.patch(`/products/${testProductIds[0]}`)
			.send({
				title : 'P-New'
			})
			.set('authorization', `Bearer ${u1Token}`);
		expect(resp.statusCode).toEqual(401);
	});

	test('not found on no such product', async function() {
		const resp = await request(app)
			.patch(`/products/0`)
			.send({
				title : 'P-New'
			})
			.set('authorization', `Bearer ${A2Token}`);
		expect(resp.statusCode).toEqual(404);
	});

	test('bad request on id change attempt', async function() {
		const resp = await request(app)
			.patch(`/products/${testProductIds[0]}`)
			.send({
				id : 5
			})
			.set('authorization', `Bearer ${A2Token}`);
		expect(resp.statusCode).toEqual(400);
	});

	test('bad request with invalid data', async function() {
		const resp = await request(app)
			.patch(`/products/${testProductIds[0]}`)
			.send({
				price : 'not-a-number'
			})
			.set('authorization', `Bearer ${A2Token}`);
		expect(resp.statusCode).toEqual(400);
	});
});

/************************************** DELETE /products/:id */

describe('DELETE /products/:id', function() {
	test('works for approved admin', async function() {
		const resp = await request(app)
			.delete(`/products/${testProductIds[0]}`)
			.set('authorization', `Bearer ${A2Token}`);
		expect(resp.body).toEqual({ deleted: testProductIds[0] });
	});

	test('unauth for unapproved admin', async function() {
		const resp = await request(app)
			.delete(`/products/${testProductIds[0]}`)
			.set('authorization', `Bearer ${A1Token}`);
		expect(resp.statusCode).toEqual(401);
	});
	test('unauth for users', async function() {
		const resp = await request(app)
			.delete(`/products/${testProductIds[0]}`)
			.set('authorization', `Bearer ${u1Token}`);
		expect(resp.statusCode).toEqual(401);
	});

	test('unauth for anon', async function() {
		const resp = await request(app).delete(`/products/${testProductIds[0]}`);
		expect(resp.statusCode).toEqual(401);
	});

	test('not found for no such product', async function() {
		const resp = await request(app).delete(`/products/0`).set('authorization', `Bearer ${A2Token}`);
		expect(resp.statusCode).toEqual(404);
	});
});
