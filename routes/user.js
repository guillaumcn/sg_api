const md5 = require('md5');
const express = require('express');

module.exports = (app, db) =>
{
	let UserRouter = express.Router();

	UserRouter.route('/')

		// Get all existing user (only for admin)
		.get(
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

					let all_users = await db.user.findAll();
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

	/*MembersRouter.route('/:id')

		// Récupère un membre avec son ID
		.get(async (req, res) =>
		{
			let member = await db.members.findOne({
				where: { id: req.params.id },
				include: [
					{
						model: db.projects,
					},
					{
						model: db.comments,
					}
				]
			});
			member = member.get({ plain: true });

			if (req.body.projects_details != 1)
				member.projects = member.projects.map(function (project) { return project.id });
			if (req.body.comments_details != 1)
				member.comments = member.comments.map(function (comment) { return comment.id });
				
			res.json(checkAndChange(member || new Error(config.errors.wrongID)));
		})

		// Modifie un membre avec ID
		.put(async (req, res) =>
		{
			let member = await db.members.findOne({
				where: { id: req.params.id }
			});
			await member.update({ name: req.body.name });
			if (req.body.projects !== undefined)
				member.setProjects(await db.projects.findAll({ where: { id: { [db.Sequelize.Op.or]: req.body.projects.split(',') } } }));
			res.json(checkAndChange("OK" || new Error(config.errors.wrongID)));
		})

		// Supprime un membre avec ID
		.delete(async (req, res) =>
		{
			let deletedNumber = await db.members.destroy({ where: { id: req.params.id } });
			res.json(checkAndChange(deletedNumber == 1 ? 'OK' : new Error(config.errors.wrongID)));
		});*/

	return UserRouter;
};