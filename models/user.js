const Sequelize=require('sequelize');
const sequelize=require('../util/database');
const User=sequelize.define('user',{
    id:{
        type:Sequelize.INTEGER,
        autoIncrement:true,
        allowNull:false,
        primaryKey:true
    },
    //name:Sequelize.STRING,
    email:
    {
        type:Sequelize.STRING,
        required:true
    } ,
    password:
    {
        type:Sequelize.STRING,
        required:true
    }  ,
    resetToken:Sequelize.STRING,
    resetTokenExpiration:Sequelize.DATE
});
module.exports=User;