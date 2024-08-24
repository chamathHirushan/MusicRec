const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database");

module.exports = sequelize.define('music',  {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate:{
      notNull: {
        msg: 'Title cannot be null'
      },
      notEmpty: {
        msg: 'Title cannot be empty'
      }
    }
  },
  isFeatured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
    validate:{
      isIn: {
        args: [[true, false]],
        msg: 'isFeatured must be either true or false'
      }
    }
  },
  musicImage: {
    type: DataTypes.STRING,
    allowNull: false,
    validate:{
      notNull: {
        msg: 'Music image cannot be null'
      }
    }
  },
  genre: {
    type: DataTypes.STRING,
    allowNull: false,
    validate:{
      notNull: {
        msg: 'Genre cannot be null'
      },
      notEmpty: {
        msg: 'Genre cannot be empty'
      }
    }
  },
  artist: {
    type: DataTypes.STRING,
    allowNull: false,
    validate:{
      notNull: {
        msg: 'artist cannot be null'
      },
      notEmpty: {
        msg: 'artist cannot be empty'
      }
    }
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
    validate:{
      notNull: {
        msg: 'Category cannot be null'
      }
    }
  },
  musicUrl: {
    type: DataTypes.STRING,
    allowNull: false,
    validate:{
      notNull: {
        msg: 'Music URL cannot be null'
      },
      notEmpty: {
        msg: 'Music URL cannot be empty'
      },
      isUrl: {
        msg: 'Invalid URL' 
      }
    }
  },
  createdAt: {
    allowNull: false,
    type: DataTypes.DATE
  },
  updatedAt: {
    allowNull: false,
    type: DataTypes.DATE
  }
},{
  paranoid: true,
  freezeTableName: true,
  modelName: 'music'
});
