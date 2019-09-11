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