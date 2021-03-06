/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('product', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		name: {
			type: DataTypes.STRING(255),
			allowNull: false
		}
	}, {
		tableName: 'product',
		timestamps: false
	});
};
