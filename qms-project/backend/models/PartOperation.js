const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PartOperation = sequelize.define('PartOperation', {
  operation_id: {
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
  machine_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'machines',
      key: 'machine_id'
    }
  },
  operation_name: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Optional description of the operation'
  },
  estimated_time_hours: {
    type: DataTypes.DECIMAL(8, 4),
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    },
    comment: 'Time in decimal hours (e.g., 1.5 = 1 hour 30 minutes)'
  },
  machine_hourly_rate: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Snapshot of machine rate at time of quote creation'
  },
  operation_cost: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    validate: {
      min: 0
    },
    comment: 'estimated_time_hours * machine_hourly_rate'
  },
  sequence_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Order of operations within a part'
  }
}, {
  tableName: 'part_operations',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = PartOperation;
