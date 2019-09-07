'use strict'

const Sequelize = require('sequelize');
const config = require('../assets/config');
const sequelize = new Sequelize(config.db.database, config.db.user, config.db.password, {
	host: config.db.host,
	dialect: 'mysql'
});

// Connect all the models/tables in the database to a db object, 
//so everything is accessible via one object
const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

//Models/tables
db.user = require('../models/user.js')(sequelize, Sequelize.DataTypes);
db.client = require('../models/client.js')(sequelize, Sequelize.DataTypes);
db.access_token = require('../models/access_token')(sequelize, Sequelize.DataTypes);
db.refresh_token = require('../models/refresh_token')(sequelize, Sequelize.DataTypes);

//Relations
db.user.hasMany(db.access_token, { foreignKey: 'user_id', sourceKey: 'id', as: 'access_tokens' });
db.access_token.belongsTo(db.user, { foreignKey: 'user_id', targetKey: 'id', as: 'user' });

db.user.hasMany(db.refresh_token, { foreignKey: 'user_id', sourceKey: 'id', as: 'refresh_tokens' });
db.refresh_token.belongsTo(db.user, { foreignKey: 'user_id', targetKey: 'id', as: 'user' });

db.user.hasMany(db.client, { foreignKey: 'user_id', sourceKey: 'id', as: 'clients' });
db.client.belongsTo(db.user, { foreignKey: 'user_id', targetKey: 'id', as: 'user' });

db.client.hasMany(db.access_token, { foreignKey: 'client_id', sourceKey: 'id', as: 'access_tokens' });
db.access_token.belongsTo(db.client, { foreignKey: 'client_id', targetKey: 'id', as: 'client' });

db.client.hasMany(db.refresh_token, { foreignKey: 'client_id', sourceKey: 'id', as: 'refresh_tokens' });
db.refresh_token.belongsTo(db.client, { foreignKey: 'client_id', targetKey: 'id', as: 'client' });

module.exports = db;