/* jshint indent: 1 */

module.exports = function (sequelize, DataTypes)
{
	return sequelize.define('client', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		secret: {
			type: DataTypes.STRING(255),
			allowNull: false
		},
		type: {
			type: DataTypes.ENUM('public', 'confidential', 'web_application', 'native_application'),
			allowNull: false,
			defaultValue: 'public'
		},
		user_id: {
			type: DataTypes.INTEGER(11),
			allowNull: false
		}
	}, {
			tableName: 'client',
			timestamps: false
		});
};
