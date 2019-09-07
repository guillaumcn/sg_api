const express = require('express');
const crypto = require('crypto');

module.exports = (app, db) =>
{
	let ClientRouter = express.Router();

	ClientRouter.route('/')

		// Get all client of an authenticated user
		.get(
			app.handlers.authenticate(),
			app.handlers.check_params({
				user: {
					match: /^[0-9]+$/,
				}
			}),
			async (req, res) =>
			{
				try 
				{
					let where = {};

					if (req.user.type != 'admin') where.user_id = req.user.id;
					// admin can select every client or only for one user
					if (req.body.user && req.user.type == 'admin') where.user_id = parseInt(req.body.user);

					let all_clients = await db.client.findAll({
						where: where
					});
					res.json(app.createResponse(all_clients));
				}
				catch (err)
				{
					res.status(500);
					res.json(app.createError('Internal error'));
				}
			})

		// Add client to an authenticated user
		.post(
			app.handlers.authenticate(),
			app.handlers.check_params({
				user: {
					match: /^[0-9]+$/,
				}
			}),
			async (req, res) =>
			{
				try 
				{
					let user = req.user.id;
					// admin can create client for other user
					if (req.body.user && req.user.type == 'admin') user = parseInt(req.body.user);

					let new_client = await db.client.create(
						{
							user_id: user,
							type: 'public',
							id: crypto.randomBytes(20).toString('hex'),
							secret: crypto.randomBytes(10).toString('hex')
						});

					res.json(app.createResponse(new_client));
				}
				catch (err)
				{
					res.status(500);
					res.json(app.createError('Internal error'));
				}
			});

	ClientRouter.route('/:id')

		// Get specific client of a authenticated user 
		.get(
			app.handlers.authenticate(),
			async (req, res) =>
			{
				try 
				{
					let where = { id: req.params.id };
					if (req.user.type != 'admin') where.user_id = req.user.id; // admin can select any client

					let client = await db.client.findOne({
						where: where
					});

					if (!client)
					{
						res.status(404);
						res.json(app.createError('Object not found'));
						return;
					}

					res.json(app.createResponse(client));
				}
				catch (err)
				{
					res.status(500);
					res.json(app.createError('Internal error'));
				}
			})

		// Update specific client (can update only type) of a authenticated user 
		.put(
			app.handlers.authenticate(),
			app.handlers.check_params({
				type: {
					required: true,
					match: /^(?:public)$/
				}
			}),
			async (req, res) =>
			{
				try 
				{
					let where = { id: req.params.id };
					if (req.user.type != 'admin') where.user_id = req.user.id; // admin can update any client

					let client = await db.client.findOne({
						where: where
					});

					if (!client)
					{
						res.status(404);
						res.json(app.createError('Object not found'));
						return;
					}

					await client.update({ type: req.body.type });
					res.json(app.createResponse("OK"));
				}
				catch (err)
				{
					res.status(500);
					res.json(app.createError('Internal error'));
				}
			})

		// Delete specific client (can update only type) of a authenticated user 
		.delete(
			app.handlers.authenticate(),
			async (req, res) =>
			{
				try 
				{
					let where = { id: req.params.id };
					if (req.user.type != 'admin') where.user_id = req.user.id; // admin can destroy any client

					let deletedNumber = await db.client.destroy({ where: where });

					if (deletedNumber == 0)
					{
						res.status(404);
						res.json(app.createError('Object not found'));
						return;
					}

					res.json(app.createResponse("OK"));
				}
				catch (err)
				{
					res.status(500);
					res.json(app.createError('Internal error'));
				}
			});

	return ClientRouter;
};