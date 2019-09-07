/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('case', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		x: {
			type: DataTypes.INTEGER(11),
			allowNull: false
		},
		y: {
			type: DataTypes.INTEGER(11),
			allowNull: false
		},
		grid_id: {
			type: DataTypes.INTEGER(11),
			allowNull: false
		},
		item_id: {
			type: DataTypes.INTEGER(11),
			allowNull: false
		}
	}, {
		tableName: 'case',
		timestamps: false
	});
};
