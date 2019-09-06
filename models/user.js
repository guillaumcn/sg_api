/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('user', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		mail: {
			type: DataTypes.STRING(255),
			allowNull: false,
			unique: true
		},
		pass: {
			type: DataTypes.STRING(255),
			allowNull: false
		},
		type: {
			type: DataTypes.STRING(255),
			allowNull: false
		}
	}, {
		tableName: 'user',
		timestamps: false
	});
};
