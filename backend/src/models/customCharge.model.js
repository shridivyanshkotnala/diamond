const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CustomCharge = sequelize.define(
  'CustomCharge',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    businessId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'businesses',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: 'custom_charges',
    timestamps: true,
    indexes: [
      {
        fields: ['businessId'],
      },
      {
        unique: true,
        fields: ['businessId', 'name'],
        name: 'unique_business_charge_name',
      },
    ],
  }
);

module.exports = CustomCharge;
