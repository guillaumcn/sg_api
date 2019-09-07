const oauthServer = require('oauth2-server');

module.exports = function (app)
{
	// optional : if set to true, request will continue even if not authenticated 
	return (optional) =>
	{
		return async (req, res, next) =>
		{
			let request = new oauthServer.Request(req);
			let response = new oauthServer.Response(res);
			let token = null;
			try 
			{
				token = await app.oauth.authenticate(request, response);
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
	};	
};