const express = require('express');
const oauthServer = require('oauth2-server');

module.exports = (app, db) =>
{
	let OauthRouter = express.Router();

	OauthRouter.route('/token').all(async (req, res, next) =>
	{
		let request = new oauthServer.Request(req);
		let response = new oauthServer.Response(res);

		let token = null;
		try { token = await app.oauth.token(request, response); }
		catch (err) {res.status(err.statusCode); res.json(app.createError(err.message)); return;}
		token.client = undefined;
		token.user = undefined;

		res.json(app.createResponse(token));
	});

	return OauthRouter;
};