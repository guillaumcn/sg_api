/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('access_token', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		access_token: {
			type: DataTypes.STRING(255),
			allowNull: false
		},
		user_id: {
			type: DataTypes.INTEGER(11),
			allowNull: false
		},
		client_id: {
			type: DataTypes.INTEGER(11),
			allowNull: false
		},
		expires: {
			type: DataTypes.DATE,
			allowNull: false
		}
	}, {
		tableName: 'access_token',
		timestamps: false
	});
};
