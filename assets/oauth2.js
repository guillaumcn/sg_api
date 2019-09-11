const md5 = require('md5');

module.exports = function (db)
{
	let oauth2 = {};

	oauth2.getAccessToken = async function (accessToken)
	{
		return new Promise(async (resolve, reject) =>
		{
			let at = await db.access_token.findOne({
				where: { access_token: accessToken },
				attributes: [
					'id',
					['access_token', 'accessToken'],
					['expires', 'accessTokenExpiresAt']
				],
				include: [
					{
						model: db.client,
						as: 'client'
					},
					{
						model: db.user,
						as: 'user'
					}
				]
			});
			at.accessToken = at.get('accessToken');
			at.accessTokenExpiresAt = at.get('accessTokenExpiresAt');

			resolve(at);
		});
	};

	oauth2.getRefreshToken = async function (refreshToken)
	{
		return new Promise(async (resolve, reject) =>
		{
			let rt = await db.refresh_token.findOne({
				where: { refresh_token: refreshToken },
				attributes: [
					['refresh_token', 'refreshToken'],
					['expires', 'refreshTokenExpiresAt']
				],
				include: [
					{
						model: db.client,
						as: 'client'
					},
					{
						model: db.user,
						as: 'user'
					}
				]
			});
			rt.refreshToken = rt.get('refreshToken');
			rt.refreshTokenExpiresAt = rt.get('refreshTokenExpiresAt');

			resolve(rt);
		});
	};

	oauth2.getClient = async function (clientId, clientSecret)
	{
		return new Promise(async (resolve, reject) =>
		{
			let client = await db.client.findOne({
				where: {
					id: clientId,
					secret: clientSecret
				},
				attributes: ['id']
			});

			client.grants = ['password', 'refresh_token'];
			resolve(client);
		});
	};

	oauth2.getUser = async function (mail, pass)
	{
		return new Promise(async (resolve, reject) =>
		{
			let user = await db.user.findOne({
				where: {
					mail: mail,
					pass: md5(pass)
				}
			});
			resolve(user);
		});
	};

	oauth2.saveToken = async function (token, client, user)
	{
		return new Promise(async (resolve, reject) =>
		{
			// save access token
			let [at, created] = await db.access_token.findOrCreate({
				where: { user_id: user.id },
				defaults: { access_token: token.accessToken, client_id: client.id, user_id: user.id, expires: token.accessTokenExpiresAt }
			});

			if (!created)
			{
				await at.update({
					access_token: token.accessToken,
					client_id: client.id,
					expires: token.accessTokenExpiresAt
				});
			}

			if (token.refreshToken)
			{
				// save refresh token
				let [rt, created] = await db.refresh_token.findOrCreate({
					where: { user_id: user.id },
					defaults: { refresh_token: token.refreshToken, client_id: client.id, user_id: user.id, expires: token.refreshTokenExpiresAt }
				});

				if (!created)
				{
					await rt.update({
						refresh_token: token.refreshToken,
						client_id: client.id,
						expires: token.refreshTokenExpiresAt
					});
				}
			}

			token.client = client;
			token.user = user;

			resolve(token);
		});
	};

	oauth2.revokeToken = async function (token)
	{
		return new Promise(async (resolve, reject) =>
		{
			let rt = await db.refresh_token.findOne({
				where: { refresh_token: token.refreshToken }
			});

			await rt.destroy();

			resolve(true);
		});
	};

	return oauth2;
}