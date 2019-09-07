const express = require('express');
const oauthServer = require('oauth2-server');

module.exports = (app, db) =>
{
	let OauthRouter = express.Router();

	OauthRouter.route('/token').all(
		app.handlers.check_params({
			mail: {
				required: true,
				match: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
			},
			pass: {
				required: true,
				min_length: 6,
				max_length: 30
			}
		}),
		(req, res, next) =>
		{
			req.body.username = req.body.mail;
			req.body.password = req.body.pass;
			next();
		},
		async (req, res) =>
		{
			let request = new oauthServer.Request(req);
			let response = new oauthServer.Response(res);

			let token = null;
			try { token = await app.oauth.token(request, response); }
			catch (err) { res.status(err.statusCode); res.json(app.createError(err.message)); return; }
			token.client = undefined;
			token.user = undefined;

			res.json(app.createResponse(token));
		});

	return OauthRouter;
};