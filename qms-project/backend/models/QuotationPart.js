const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const QuotationPart = sequelize.define('QuotationPart', {
  part_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  quotation_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'quotations',
      key: 'quotation_id'
    },
    onDelete: 'CASCADE'
  },
  part_number: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  part_description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: 1
    }
  },
  unit_material_cost: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  unit_operations_cost: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  unit_auxiliary_cost: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  unit_total_cost: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  part_subtotal: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
    validate: {
      min: 0
    },
    comment: 'unit_total_cost * quantity'
  },
  sequence_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Order of parts in quotation'
  }
}, {
  tableName: 'quotation_parts',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = QuotationPart;
