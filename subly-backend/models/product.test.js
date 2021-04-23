'use strict';

const { NotFoundError, BadRequestError } = require('../expressError');
const db = require('../db.js');
const Product = require('./Product.js');
const { commonBeforeAll, commonBeforeEach, commonAfterEach, commonAfterAll, testProductIds } = require('./_testCommon');

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe('create', function() {
	let newProduct = {
		title       : 'Test',
		price       : 100,
		description : 'test desciption',
		imageUrl    : 'testUrl.jpg'
	};

	test('works', async function() {
		let product = await Product.create(newProduct);
		expect(product).toEqual({
			...newProduct,
			id : expect.any(Number)
		});
	});
});

/************************************** findAll */

describe('findAll', function() {
	test('works: no filter', async function() {
		let Products = await Product.findAll();
		expect(Products).toEqual([
			{
				id          : testProductIds[0],
				title       : 'Product1',
				price       : 100,
				description : 'this is desription #1',
				imageUrl    : 'http://p1.img'
			},
			{
				id          : testProductIds[1],
				title       : 'Product2',
				price       : 200,
				description : 'this is desription #2',
				imageUrl    : 'http://p2.img'
			},
			{
				id          : testProductIds[2],
				title       : 'Product3',
				price       : 300,
				description : 'this is desription #3',
				imageUrl    : 'http://p3.img'
			},
			{
				id          : testProductIds[3],
				title       : 'Product4',
				price       : 400,
				description : 'this is desription #4',
				imageUrl    : null
			}
		]);
	});

	test('works: by max price', async function() {
		let Products = await Product.findAll({ maxPrice: 200 });
		expect(Products).toEqual([
			{
				id          : testProductIds[0],
				title       : 'Product1',
				price       : 100,
				description : 'this is desription #1',
				imageUrl    : 'http://p1.img'
			},
			{
				id          : testProductIds[1],
				title       : 'Product2',
				price       : 200,
				description : 'this is desription #2',
				imageUrl    : 'http://p2.img'
			}
		]);
	});

	test('works: by description', async function() {
		let Products = await Product.findAll({ description: '#2' });
		expect(Products).toEqual([
			{
				id          : testProductIds[1],
				title       : 'Product2',
				price       : 200,
				description : 'this is desription #2',
				imageUrl    : 'http://p2.img'
			}
		]);
	});

	test('works: by max price & description', async function() {
		let Products = await Product.findAll({ maxPrice: 400, description: '#4' });
		expect(Products).toEqual([
			{
				id          : testProductIds[3],
				title       : 'Product4',
				price       : 400,
				description : 'this is desription #4',
				imageUrl    : null
			}
		]);
	});

	test('works: by name', async function() {
		let Products = await Product.findAll({ title: 'uct1' });
		expect(Products).toEqual([
			{
				id          : testProductIds[0],
				title       : 'Product1',
				price       : 100,
				description : 'this is desription #1',
				imageUrl    : 'http://p1.img'
			}
		]);
	});
});

/************************************** get */

describe('get', function() {
	test('works', async function() {
		let product = await Product.get(testProductIds[0]);
		expect(product).toEqual({
			id          : testProductIds[0],
			title       : 'Product1',
			price       : 100,
			description : 'this is desription #1',
			imageUrl    : 'http://p1.img'
		});
	});

	test('not found if no such product', async function() {
		try {
			await Product.get(0);
			fail();
		} catch (err) {
			expect(err instanceof NotFoundError).toBeTruthy();
		}
	});
});

/************************************** update */

describe('update', function() {
	let updateData = {
		title       : 'New',
		price       : 500,
		description : 'new description',
		imageUrl    : 'newImage.img'
	};
	test('works', async function() {
		let product = await Product.update(testProductIds[0], updateData);
		expect(product).toEqual({
			id : testProductIds[0],
			...updateData
		});
	});

	test('not found if no such Product', async function() {
		try {
			await Product.update(0, {
				title : 'test'
			});
			fail();
		} catch (err) {
			expect(err instanceof NotFoundError).toBeTruthy();
		}
	});

	test('bad request with no data', async function() {
		try {
			await Product.update(testProductIds[0], {});
			fail();
		} catch (err) {
			expect(err instanceof BadRequestError).toBeTruthy();
		}
	});
});

/************************************** remove */

describe('remove', function() {
	test('works', async function() {
		await Product.remove(testProductIds[0]);
		const res = await db.query('SELECT id FROM Products WHERE id=$1', [ testProductIds[0] ]);
		expect(res.rows.length).toEqual(0);
	});

	test('not found if no such Product', async function() {
		try {
			await Product.remove(0);
			fail();
		} catch (err) {
			expect(err instanceof NotFoundError).toBeTruthy();
		}
	});
});
