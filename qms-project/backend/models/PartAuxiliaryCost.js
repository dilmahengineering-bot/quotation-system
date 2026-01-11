const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PartAuxiliaryCost = sequelize.define('PartAuxiliaryCost', {
  part_aux_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  part_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'quotation_parts',
      key: 'part_id'
    },
    onDelete: 'CASCADE'
  },
  aux_type_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'auxiliary_costs',
      key: 'aux_type_id'
    }
  },
  cost_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    },
    comment: 'Editable cost for this specific part'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Additional notes for this auxiliary cost'
  }
}, {
  tableName: 'part_auxiliary_costs',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = PartAuxiliaryCost;
