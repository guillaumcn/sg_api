/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('refresh_token', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		refresh_token: {
			type: DataTypes.STRING(255),
			allowNull: false
		},
		client_id: {
			type: DataTypes.INTEGER(11),
			allowNull: false
		},
		user_id: {
			type: DataTypes.INTEGER(11),
			allowNull: false
		},
		expires: {
			type: DataTypes.DATE,
			allowNull: true
		}
	}, {
		tableName: 'refresh_token',
		timestamps: false
	});
};
