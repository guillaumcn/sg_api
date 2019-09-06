var SequelizeAuto = require('sequelize-auto');
const config = require('./assets/config');
var auto = new SequelizeAuto(config.db.database, config.db.user, config.db.password, {
	host: config.db.host,
	port: config.db.port
});

auto.run(function (err)
{
	if (err) throw err;

	console.log(auto.tables); // table list
	console.log(auto.foreignKeys); // foreign key list
});