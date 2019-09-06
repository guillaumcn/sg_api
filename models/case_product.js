/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('case_product', {
		case_id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true
		},
		product_id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true
		}
	}, {
		tableName: 'case_product',
		timestamps: false
	});
};
