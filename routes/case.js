const express = require('express');

module.exports = (app, db) =>
{
	let CaseRouter = express.Router();

	CaseRouter.route('/:grid_id/case')

		// Get all cases of a grid
		.get(
			app.handlers.authenticate(),
			app.handlers.check_params({
				details: {
					match: /(?:true|false|1|0)/
				}
			}),
			async (req, res) =>
			{
				try 
				{
					let request = { where: { grid_id: req.params.grid_id } };
					if (req.body.details == 'true' || req.body.details == '1')
					{
						request.include = [
							{
								model: db.product,
								as: 'products'
							}
						];
					}

					let all_cases = await db.case.findAll(request);
					res.json(app.createResponse(all_cases));
				}
				catch (err)
				{
					res.status(500);
					res.json(app.createError('Internal error'));
				}
			})

		// Add case to a grid
		.post(
			app.handlers.authenticate(),
			app.handlers.check_params({
				x: {
					required: true,
					min_length: 1,
					match: /^[0-9]+$/
				},
				y: {
					required: true,
					min_length: 1,
					match: /^[0-9]+$/
				},
				item: {
					required: true,
					min_length: 1,
					match: /^[0-9]+$/
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

					let neighbours = await db.case.findAll({
						"where":
							db.Sequelize.or(
								{ "x": parseInt(req.body.x) - 1, "y": parseInt(req.body.y) },
								{ "x": parseInt(req.body.x), "y": parseInt(req.body.y) + 1 },
								{ "x": parseInt(req.body.x) + 1, "y": parseInt(req.body.y) },
								{ "x": parseInt(req.body.x), "y": parseInt(req.body.y) - 1 }
							)
					});
					
					if (!neighbours || neighbours.length == 0)
					{
						res.status(400);
						res.json(app.createError('Cannot create case without neighbours'));
						return;
					}

					let new_case = await db.case.create(
						{
							x: parseInt(req.body.x),
							y: parseInt(req.body.y),
							item: parseInt(req.body.item),
							grid_id: parseInt(req.params.grid_id)
						});

					res.json(app.createResponse(new_case));
				}
				catch (err)
				{
					console.log(err);
					if (err.parent.code == 'ER_DUP_ENTRY')
					{
						res.status(409);
						res.json(app.createError('X-Y pair already existing'));
					}

					res.status(500);
					res.json(app.createError('Internal error'));
				}
			});

	CaseRouter.route('/:grid_id/case/:id')

		// get a case with its id
		.get(
			app.handlers.authenticate(),
			app.handlers.check_params({
				details: {
					match: /(?:true|false|1|0)/
				}
			}),
			async (req, res) =>
			{
				try
				{
					let request = { where: { grid_id: req.params.grid_id, id: req.params.id } };
					if (req.body.details == 'true' || req.body.details == '1')
					{
						request.include = [
							{
								model: db.product,
								as: 'products'
							}
						];
					}

					let c = await db.case.findOne(request);

					if (!c)
					{
						res.status(404);
						res.json(app.createError('Object not found'));
						return;
					}

					res.json(app.createResponse(c));
				}
				catch (err)
				{
					res.status(500);
					res.json(app.createError('Internal error'));
				}
			})

		// update a case with its id
		.put(
			app.handlers.authenticate(),
			app.handlers.check_params({
				item: {
					min_length: 1,
					match: /^[0-9]+$/
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

					let c = await db.case.findOne({
						where: { grid_id: req.params.grid_id, id: req.params.id }
					});

					if (!c)
					{
						res.status(404);
						res.json(app.createError('Object not found'));
						return;
					}

					let update = {};
					if (req.body.item) update.item = parseInt(req.body.item);
					await c.update(update);

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

					let c = await db.case.findOne({
						where: { grid_id: req.params.grid_id, id: req.params.id }
					});

					if (!c)
					{
						res.status(404);
						res.json(app.createError('Object not found'));
						return;
					}

					await c.destroy();
					res.json(app.createResponse("OK"));
				}
				catch (err)
				{
					res.status(500);
					res.json(app.createError('Internal error'));
				}
			});

	return CaseRouter;
};