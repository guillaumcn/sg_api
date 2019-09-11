const express = require('express');

module.exports = (app, db) =>
{
	let CasesRouter = express.Router();

	CasesRouter.route('/:grid_id/cases')

		// create new line
		.post(
			app.handlers.authenticate(),
			app.handlers.check_params({
				direction: {
					required: true,
					match: /(?:0|1|2|3)/
				},
				item: {
					required: true,
					match: /[0-9]+/
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

					let direction = parseInt(req.body.direction);

					let add_position = 0;
					let add_attribute = direction == 0 || direction == 2 ? 'x' : 'y';

					if (direction == 1 || direction == 2) // get maximum position
					{
						add_position = parseInt((await db.case.findOne({
							where: { grid_id: req.params.grid_id },
							attributes: [[db.sequelize.fn('max', db.sequelize.col(add_attribute)), 'max']]
						})).get('max')) + 1;
					}
					else // we have to move everything
					{
						let increment = {};
						increment[add_attribute] = db.sequelize.literal(add_attribute + ' + 1');
						await db.case.update(increment, { where: { grid_id: req.params.grid_id } });
					}

					// know how many cases we have to create
					let count_attribute = direction == 0 || direction == 2 ? 'y' : 'x';
					let case_count = parseInt((await db.case.findOne({
						where: { grid_id: req.params.grid_id },
						attributes: [[db.sequelize.fn('max', db.sequelize.col(count_attribute)), 'max']]
					})).get('max'));

					let cases = [];
					for (let i = 0; i <= case_count; i++)
					{
						let c = {
							item: parseInt(req.body.item),
							grid_id: parseInt(req.params.grid_id)
						};
						c[add_attribute] = add_position;
						c[count_attribute] = i;
						cases.push(c);
					}

					cases = await db.case.bulkCreate(cases);

					res.json(app.createResponse(cases));
				}
				catch (err)
				{
					res.status(500);
					res.json(app.createError('Internal error'));
				}
			})

		// update multiple cases
		.put(
			app.handlers.authenticate(),
			app.handlers.check_params({
				cases: { // array of id representing cases to update (JSON format)
					required: true,
					match: /\[.*\]/
				},
				item: {
					required: true,
					match: /[0-9]+/
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

					let cond = {
						where: db.sequelize.or(
							{ id: JSON.parse(req.body.cases) }
						)
					};

					await db.case.update({ item: parseInt(req.body.item) }, cond);

					res.json(app.createResponse('OK'));
				}
				catch (err)
				{
					res.status(500);
					res.json(app.createError('Internal error'));
				}
			});

	return CasesRouter;
};