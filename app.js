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
			accessTokenLifetime: 3155760000,
			refreshTokenLifetime: 3155760000
		});

		// authentication middleware (add user and client to request)
		app.handlers = {};
		app.handlers.authenticate = require('./handlers/authenticate')(app);
		app.handlers.check_params = require('./handlers/check_params')(app);

		app.route(config.rootAPI).all(app.handlers.authenticate(true), (req, res) =>
		{
			let text = '<h1>API Home</h1><br/><br/>';
			if (req.isAuthenticated) text += '<h3>You\'re authenticated as '+req.user.mail+'</h3>';
			res.send(text);
		});

		app.use(config.rootAPI + 'oauth', require('./routes/oauth')(app, db));
		app.use(config.rootAPI + 'user', require('./routes/user')(app, db));
		app.use(config.rootAPI + 'client', require('./routes/client')(app, db));

		app.listen(config.port, () => console.log('Started on port ' + config.port));
	})
	.catch((err) =>
	{
		console.log(err);
	});