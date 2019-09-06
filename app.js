const bodyParser = require('body-parser');
const express = require('express');
const morgan = require('morgan')('dev');
const config = require('./assets/config');
const oauthServer = require('oauth2-server');

const db = require('./assets/db');

db.sequelize.authenticate()
	.then(() =>
	{
		console.log('Connected to db with sequelize.');

		const app = express();

		app.use(morgan);
		app.use(bodyParser.json());
		app.use(bodyParser.urlencoded({ extended: true }));

		app.createResponse = (response) => { return { result: 'success', response: response } };
		app.createError = (message) => { return { result: 'error', message: message } };

		app.oauth = new oauthServer({
			model: require('./assets/oauth2')(db),
			accessTokenLifetime: 3600,
			refreshTokenLifetime: 3155760000
		});

		// authentication middleware (add user and client to request)
		// optional : if set to true, request will continue even if not authenticated 
		app.oauth.authenticateHandler = (optional, options) =>
		{
			return async (req, res, next) =>
			{
				let request = new oauthServer.Request(req);
				let response = new oauthServer.Response(res);
				let token = null;
				try 
				{
					token = await app.oauth.authenticate(request, response, options);
					req.user = token.user;
					req.client = token.client;
				}
				catch (err) 
				{
					if (!optional)
					{
						res.status(401);
						res.json(app.createError('Missing or invalid token'));
						return;
					}
				}
				next();
			}
		}

		app.route(config.rootAPI).all(app.oauth.authenticateHandler(true), (req, res) =>
		{
			let text = '<h1>API Home</h1><br/><br/>';
			if (req.isAuthenticated) text += '<h3>You\'re authenticated as '+req.user.mail+'</h3>';
			res.send(text);
		});

		app.use(config.rootAPI + 'user', require('./routes/user')(app, db));
		app.use(config.rootAPI + 'oauth', require('./routes/oauth')(app, db));

		app.listen(config.port, () => console.log('Started on port ' + config.port));
	})
	.catch((err) =>
	{
		console.log(err);
	});