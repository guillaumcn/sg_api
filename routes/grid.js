const express = require('express');

module.exports = (app, db) =>
{
	let GridRouter = express.Router();

	GridRouter.route('/')

		// Get all grids
		.get(
			app.handlers.authenticate(),
			async (req, res) =>
			{
				try 
				{
					let all_grids = await db.grid.findAll();
					res.json(app.createResponse(all_grids));
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

					let new_grid = await db.grid.create(
						{
							name: req.body.name
						});

					res.json(app.createResponse(new_grid));
				}
				catch (err)
				{
					res.status(500);
					res.json(app.createError('Internal error'));
				}
			});

	GridRouter.route('/:id')

		// get a grid with its id
		.get(
			app.handlers.authenticate(),
			async (req, res) =>
			{
				try
				{
					let grid = await db.grid.findOne({
						where: { id: req.params.id },
						include: [{
							model: db.case,
							as: 'cases',
							attributes: ['x', 'y'],
							include: [
								{
									model: db.product,
									as: 'products'
								},
								{
									model: db.item,
									as: 'item'
								}
							],
							order: [db.sequelize.col('x'), db.sequelize.col('y')],
						}]
					});

					if (!grid)
					{
						res.status(404);
						res.json(app.createError('Object not found'));
						return;
					}

					res.json(app.createResponse(grid));
				}
				catch (err)
				{
					res.status(500);
					res.json(app.createError('Internal error'));
				}
			})

		// update a grid with its id
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

					let grid = await db.grid.findOne({
						where: { id: req.params.id }
					});

					if (!grid)
					{
						res.status(404);
						res.json(app.createError('Object not found'));
						return;
					}

					let update = {};
					if (req.body.name) update.name = req.body.name;
					await grid.update(update);
					res.json(app.createResponse("OK"));
				}
				catch (err)
				{
					res.status(500);
					res.json(app.createError('Internal error'));
				}
			})

		// delete a grid with its id
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

					let grid = await db.grid.findOne({
						where: { id: req.params.id }
					});

					if (!grid)
					{
						res.status(404);
						res.json(app.createError('Object not found'));
						return;
					}

					await grid.destroy();
					res.json(app.createResponse("OK"));
				}
				catch (err)
				{
					res.status(500);
					res.json(app.createError('Internal error'));
				}
			});

	return GridRouter;
};