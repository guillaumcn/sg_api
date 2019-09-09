const express = require('express');

module.exports = (app, db) =>
{
	let ProductRouter = express.Router();

	ProductRouter.route('/')

		// Get all products
		.get(
			app.handlers.authenticate(),
			async (req, res) =>
			{
				try 
				{
					let all_products = await db.product.findAll();
					res.json(app.createResponse(all_products));
				}
				catch (err)
				{
					res.status(500);
					res.json(app.createError('Internal error'));
				}
			})

		// Add grid
		.post(
			app.handlers.authenticate(),
			app.handlers.check_params({
				name: {
					required: true,
					min_length: 1
				}
			}),
			async (req, res) =>
			{
				try 
				{
					if (req.user.type != 'admin')
					{
						res.status(403);
						res.json(app.createError('Not allowed'));
						return;
					}

					let new_product = await db.product.create(
						{
							name: req.body.name
						});

					res.json(app.createResponse(new_product));
				}
				catch (err)
				{
					res.status(500);
					res.json(app.createError('Internal error'));
				}
			});

	ProductRouter.route('/:id')

		// get a grid with its id
		.get(
			app.handlers.authenticate(),
			async (req, res) =>
			{
				try
				{
					let product = await db.product.findOne({ where: { id: req.params.id } });

					if (!product)
					{
						res.status(404);
						res.json(app.createError('Object not found'));
						return;
					}

					res.json(app.createResponse(product));
				}
				catch (err)
				{
					res.status(500);
					res.json(app.createError('Internal error'));
				}
			})

		// update a product with its id
		.put(
			app.handlers.authenticate(),
			app.handlers.check_params({
				name: {
					min_length: 1,
				}
			}),
			async (req, res) =>
			{
				try 
				{
					if (req.user.type != 'admin')
					{
						res.status(403);
						res.json(app.createError('Not allowed'));
						return;
					}

					let product = await db.product.findOne({
						where: { id: req.params.id }
					});

					if (!product)
					{
						res.status(404);
						res.json(app.createError('Object not found'));
						return;
					}

					let update = {};
					if (req.body.name) update.name = req.body.name;
					await product.update(update);

					res.json(app.createResponse("OK"));
				}
				catch (err)
				{
					res.status(500);
					res.json(app.createError('Internal error'));
				}
			})

		// delete a product with its id
		.delete(
			app.handlers.authenticate(),
			async (req, res) =>
			{
				try
				{
					if (req.user.type != 'admin')
					{
						res.status(403);
						res.json(app.createError('Not allowed'));
						return;
					}

					let product = await db.product.findOne({
						where: { id: req.params.id }
					});

					if (!product)
					{
						res.status(404);
						res.json(app.createError('Object not found'));
						return;
					}

					await product.destroy();
					res.json(app.createResponse("OK"));
				}
				catch (err)
				{
					res.status(500);
					res.json(app.createError('Internal error'));
				}
			});

	return ProductRouter;
};