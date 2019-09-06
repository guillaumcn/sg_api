const md5 = require('md5');
const express = require('express');

module.exports = function (app, db)
{
	let UserRouter = express.Router();

	UserRouter.route('/')

		// Récupère tous les membres
		/*.get(async (req, res) =>
		{
			if (req.query.max !== undefined && (isNaN(req.query.max) || parseInt(req.query.max) < 1))
			{
				res.json(checkAndChange(new Error(config.errors.wrongMaxValue)));
				return;
			}

			var options = {
				include: [
					{
						model: db.projects,
						attributes: ['id']
					},
					{
						model: db.comments,
						attributes: ['id']
					}
				]
			};
			if (req.query.max) options.limit = parseInt(req.query.max);
			let allMembers = await db.members.findAll(options);
			res.json(checkAndChange(allMembers))
		})*/

		// Add user with password and mail
		.post(app.oauth.authenticateHandler(true), async (req, res) =>
		{
			try 
			{
				let user_count = await db.user.count({
					distinct: true,
					col: 'id'
				});

				let new_user = null;
				if (user_count === 0) // if no existing user, create admin
					new_user = await db.user.create({ mail: 'admin', type: 'admin', pass: md5(req.body.pass) });
				else
				{
					// Parameters check
					if (!req.body.mail || !req.body.pass || !req.body.type)
					{
						res.status(400);
						res.json(app.createError('Missing parameter'));
						return;
					}

					// if not admin try to create admin
					if (req.body.type == 'admin' && (!req.user || req.user.type != 'admin'))
					{
						res.status(403);
						res.json(app.createError('Cannot create admin user'));
						return;
					}

					new_user = await db.user.create({ mail: req.body.mail, type: req.body.type, pass: md5(req.body.pass) });
				}

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