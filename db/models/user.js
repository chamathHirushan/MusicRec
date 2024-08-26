'use strict';
const {
  Model,
  Sequelize,
  DataTypes
} = require('sequelize');
const bcrypt = require('bcrypt');
const sequelize = require('../../config/database');
const AppError = require('../../utils/appError');
const music = require('./music');



const user = sequelize.define('user', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      userType: {
        type: DataTypes.ENUM('0','1','2'), // 0-admin, 1- guest, 2-user
        allowNull: false,
        validate:{
          notNull: {
            msg: 'User type cannot be null'
          },
          notEmpty: {
            msg: 'User type cannot be empty'
          }
        }
      },
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate:{
          notNull: {
            msg: 'First name cannot be null'
          },
          notEmpty: {
            msg: 'First name cannot be empty'
          }
        }
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate:{
          notNull: {
            msg: 'Last name cannot be null'
          },
          notEmpty: {
            msg: 'Last name cannot be empty'
          }
        }
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate:{
          notNull: {
            msg: 'Email cannot be null'
          },
          notEmpty: {
            msg: 'Email type cannot be empty'
          },
          isEmail: {
            msg: 'Invalid Email'
          }
        }
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate:{
          notNull: {
            msg: 'Password cannot be null'
          },
          notEmpty: {
            msg: 'Password type cannot be empty'
          }
        }
      },

      confirmPassword: {
        type: DataTypes.VIRTUAL,
        set(value) {
          if(this.password.length < 7){
            throw new AppError('Password must be at least 7 characters long', 400);
          }
          if (value === this.password) {
            const hashPassword = bcrypt.hashSync(value, 10);
            this.setDataValue('password', hashPassword);
          }
          else {
            throw new AppError('Password confirmation does not match password', 400);
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
      },
      deletedAt: {
        type: DataTypes.DATE
      }
    },
    {
      paranoid: true,
      freezeTableName: true,
      modelName: 'user',
    });


user.hasMany(music, {
  foreignKey: 'id'});
  music.belongsTo(user,{
    foreignKey: 'id'
  });

module.exports = user;