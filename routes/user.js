const md5 = require('md5');
const express = require('express');

module.exports = (app, db) =>
{
	let UserRouter = express.Router();

	UserRouter.route('/')

		// Get all existing user (only for admin)
		.get(
			app.handlers.authenticate(),
			app.handlers.check_params({
				type: {
					match: /^(?:admin|user|designer)$/
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

					let where = {};
					if (req.body.type) where.type = req.body.type;

					let all_users = await db.user.findAll({ where: where });
					res.json(app.createResponse(all_users));
				}
				catch (err)
				{
					res.status(500);
					res.json(app.createError('Internal error'));
				}
			})

		// Add user with password and mail
		.post(
			app.handlers.authenticate(true),
			app.handlers.check_params({
				mail: {
					required: true,
					match: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
				},
				pass: {
					required: true,
					min_length: 6,
					max_length: 30
				},
				type: {
					required: true,
					match: /^(?:admin|user|designer)$/
				}
			}),
			async (req, res) =>
			{
				try 
				{
					// if not admin try to create admin
					if (req.body.type == 'admin' && (!req.user || req.user.type != 'admin'))
					{
						res.status(403);
						res.json(app.createError('Not allowed'));
						return;
					}

					let new_user = await db.user.create({ mail: req.body.mail, type: req.body.type, pass: md5(req.body.pass) });

					new_user.pass = undefined;
					res.json(app.createResponse(new_user));
				}
				catch (err)
				{
					if (err.parent.code == 'ER_DUP_ENTRY')
					{
						res.status(409);
						res.json(app.createError('Mail already registered'));
						return;
					}

					res.status(500);
					res.json(app.createError('Internal error'));
				}
			});

	UserRouter.route('/:id')

		// get a user with its id
		.get(
			app.handlers.authenticate(),
			async (req, res) =>
			{
				try
				{
					if (req.user.type != 'admin' && (req.params.id != req.user.id))
					{
						res.status(403);
						res.json(app.createError('Not allowed'));
						return;
					}

					let user = await db.users.findOne({
						where: { id: req.params.id }
					});

					if (!user)
					{
						res.status(404);
						res.json(app.createError('Object not found'));
						return;
					}

					user.pass = undefined;
					res.json(app.createResponse(user));
				}
				catch (err)
				{
					res.status(500);
					res.json(app.createError('Internal error'));
				}
			})

		// Modifie un membre avec ID
		.put(
			app.handlers.authenticate(),
			async (req, res) =>
			{
				try 
				{
					if (req.user.type != 'admin' && (req.params.id != req.user.id))
					{
						res.status(403);
						res.json(app.createError('Not allowed'));
						return;
					}

					let user = await db.user.findOne({
						where: { id: req.params.id }
					});

					if (!user)
					{
						res.status(404);
						res.json(app.createError('Object not found'));
						return;
					}

					await user.update({ name: req.body.name });
					res.json(app.createResponse("OK"));
				}
				catch (err)
				{
					res.status(500);
					res.json(app.createError('Internal error'));
				}
			})

		// remove a user with its id
		.delete(
			app.handlers.authenticate(),
			async (req, res) =>
			{
				try
				{
					if (req.user.type != 'admin' && (req.params.id != req.user.id))
					{
						res.status(403);
						res.json(app.createError('Not allowed'));
						return;
					}

					let user = await db.user.findOne({
						where: { id: req.params.id }
					});

					if (!user)
					{
						res.status(404);
						res.json(app.createError('Object not found'));
						return;
					}

					await user.destroy({ name: req.body.name });
					res.json(app.createResponse("OK"));
				}
				catch (err)
				{
					res.status(500);
					res.json(app.createError('Internal error'));
				}
			});

	return UserRouter;
};