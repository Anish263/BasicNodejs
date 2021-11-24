const Sequelize=require('sequelize');
const sequelize=new Sequelize('mydb','root','root',{
    dialect:'mysql',
    host:'localhost'
});
// const mysql=require('mysql2');  

// const pool=mysql.createPool({
//     host:'localhost',
//     user:'root',
//     password:'root',
//     database:"mydb"
    
// });
// module.exports=pool.promise();
module.exports=sequelize;