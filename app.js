const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const db=require('./util/database');
const sequelize=require('./util/database');
const errorController = require('./controllers/error');
const csrf =require('csurf');


const flash=require('connect-flash');


const session=require('express-session');
const Product=require('./models/product');
const User=require('./models/user');

const Cart=require('./models/cart');
const CartItem=require('./models/cart-item');

const Order=require('./models/order');
const OrderItem=require('./models/order-item');


const MysqlStore=require('express-mysql-session')(session);
const options = {                 // setting connection options
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'mydb',
};
const sessionStore=new MysqlStore(options);



const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes=require('./routes/auth');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));



app.use(session(
    {secret:'my secret',
    resave:false,
    saveUninitialized:false,
    store:sessionStore,
    cookie: {
        sameSite: true,
        
        path: '/'
      
    }})
);

const csrfProtection=csrf();
app.use(csrfProtection);
app.use(flash())

app.use('/500',errorController.get500);


app.get((error,req,res,next)=>{
    res.redirect('/500');
});



app.use((req,res,next)=>{
    if (!req.session.user) {
        return next();
      }
    User.findByPk(req.session.user.id)
    .then(user =>{
        if(!user){
            return next();
        }
        req.user=user;
        next();
    })
    .catch(err =>{
        const error=new Error(err);
        error.httpStatusCode=500;
        return next(error);
    });
})


app.use((req,res,next)=>{
    res.locals.isAuthenticated=req.session.isLoggedIn;
    res.locals.csrfToken=req.csrfToken();
    next();
})

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
app.use(errorController.get404);


Product.belongsTo(User,{constraints:true,onDelete:'CASCADE'});
User.hasMany(Product);
User.hasOne(Cart);
Cart.belongsTo(User);
Cart.belongsToMany(Product,{through:CartItem});
Product.belongsToMany(Cart,{through:CartItem});
Order.belongsTo(User);
User.hasMany(Order);
Order.belongsToMany(Product,{through:OrderItem});

sequelize
.sync()
//.sync({force:true})
// .then(result=>{
//    // console.log(result);
//     return User.findByPk(1);
// })
// .then(user=>{
// if(!user){
//     return User.create({name:'Max',email:'guptaanish@gmail.com'})
// }
// return user;
// })
// .then(user=>{
//     return user.createCart();
//     console.log('>>>>>>>>>>>>>>> USER   ',user);
// })
// .then(cart=>{
//     //console.log('>>>>>>>>>>>>>>> USER   ',user);
//     console.log('>>>>>>>>>>>>>>> CART  ',cart);

.then(result=>{
    app.listen(3000);
})
.catch(err=>{
    console.log(err);
});

