module.exports = function (app)
{
	/* params : object {
		param_name: {
			required: true,
			min_length: 3,
			max_length: 16,
			match: /ab+c/i
		}
	}*/
	return (params) =>
	{
		return async (req, res, next) =>
		{
			if (!params)
			{
				next();
				return;
			}

			let error_message = '';
			for (const param in params) 
			{
				if (params[param].required && req.body[param] === undefined)
				{
					error_message = 'Missing required parameter : "' + param + '"';
					break;
				}

				if (params[param].min_length !== undefined && req.body[param] !== undefined && req.body[param].length < params[param].min_length)
				{
					error_message = 'Parameter too short : "' + param + '"';
					break;
				}

				if (params[param].max_length !== undefined && req.body[param] !== undefined && req.body[param].length > params[param].max_length)
				{
					error_message = 'Parameter too long : "' + param + '"';
					break;
				}

				if (params[param].match !== undefined && req.body[param] !== undefined && !req.body[param].match(params[param].match))
				{
					error_message = 'Parameter did not match : "' + param + '"';
					break;
				}
			}

			if (error_message !== '')
			{
				res.status(400);
				res.json(app.createError(error_message));
				return;
			}

			next();
		}
	};	
};