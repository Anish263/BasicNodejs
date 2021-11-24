const crypto=require('crypto');
const User = require("../models/user");
const bcrypt=require('bcryptjs');
const { validationResult }=require('express-validator/check');
exports.getLogin = (req, res, next) => {
   // const isLoggedIn=req.get('Cookie').trim().split('=')[1];
    //console.log('>>>>>>>>>>>>',isLoggedIn);
   // console.log(req.session.isLoggedIn);    
    //console.log(req.get('Cookie'));
    let message=req.flash('error');
    if(message.length >0){
      message=message[0];
    }else{
      message=null;
    }
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        isAuthenticated:false,
        errorMessage:message,oldInput:{
          email:'',
          password:''
        },
        validationErrors:[]
    }); 
  };
exports.postLogin=(req,res,next)=>{
      const email=req.body.email;
      const password=req.body.password;
      
      const errors=validationResult(req);
      console.log(errors.array());
    if(!errors.isEmpty()){
      console.log(errors.array());
      return res.status(422).render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        isAuthenticated:false,
        errorMessage:errors.array()[0].msg,
        oldInput:{
          email:email,
          password:password
        },
        validationErrors:errors.array()
      })
}
   User.findOne({where:{email:email}})
   .then((user)=>{
     if(!user){
      return res.status(422).render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        isAuthenticated:false,
        errorMessage:"Invalid email or password",
        oldInput:{
          email:email,
          password:password
        },
        validationErrors:errors.array()
     });
    }
     bcrypt.compare(password,user.password)
     .then(doMatch=>{
       if(doMatch){
        req.session.user=user;
        req.session.isLoggedIn=true;
        return req.session.save((err)=>{
          console.log(err);
          res.redirect('/');
       });
      }
      return res.status(422).render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        isAuthenticated:false,
        errorMessage:"Invalid email or password",
        oldInput:{
          email:email,
          password:password
        },
        validationErrors:errors.array()
     });
     })
     .catch(err=>{
      res.redirect('/login');
     }); 
   }).catch((err)=>{
     console.log(err);
   })
   
   // req.session.isLoggedIn=true;
    //res.setHeader('Set-Cookie','loggedIn=true');
    //req.isLoggedIn=true;
  };
exports.postLogout=(req,res,next)=>{
  req.session.destroy(err=>{
    console.log(err);
    res.redirect('/');
  })
}

exports.getSignup=(req,res,next)=>{
  let message=req.flash('error');
    if(message.length >0){
      message=message[0];
    }else{
      message=null;
    }
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    isAuthenticated:false,
    errorMessage:message,
    oldInput:{
      email:'',
      password:'',
      confirmPassword:''
    },
    validationErrors:[]

}); 
};
exports.postSignup=(req,res,next)=>{

  const email=req.body.email;

  const password=req.body.password;

  const confirmPassword=req.body.confirmPassword;

  //console.log("email>>>>>>>>>>>>>",email);



  const errors = validationResult(req);



  if(!errors.isEmpty()){

    console.log(errors.array());

    return res.status(422).render('auth/signup', {

      path: '/signup',

      pageTitle: 'Signup',

      errorMessage: errors.array()[0].msg,

      oldInput: { email: email, password: password, confirmPassword: confirmPassword},

      validationErrors: errors.array()

     

  });

  }
  bcrypt

  .hash(password,12)

  .then(hashedPassword=>{

    const user=new User({



      email:email,

      password:hashedPassword

  });

 

 // console.log('>>>>>>>>>',user);

  return user.save();

 

})

.then(user=>{

  // console.log('>>>>>>>>>',user);

 return user.createCart();

 // console.log('>>>>>>>>>>>>>>> USER   ',user);

}).then(cart=>{

console.log("CART >>>",cart);

})



.then(result=>{

  res.redirect('/login');

})



 

.catch(err=>{

  console.log(err);

});



};
exports.getReset=(req,res,next)=>{
    let message=req.flash('error');
    if(message.length >0){
      message=message[0];
    }else{
      message=null;
    }
    res.render('auth/reset',{
      path:'/reset',
      pageTitle:'Reset Password',
      errorMessage:message
    });
  };
  
  exports.postReset=(req,res,next)=>{
    crypto.randomBytes(32,(err,buffer)=>{
      if(err){
        console.log(err);
        return res.redirect('/reset');
      }
      const token=buffer.toString('hex');
      User.findOne({where:{email:req.body.email}})
      .then(user=>{
        if(!user){
          req.flash('error','No account with this email found');
          return res.redirect('/reset');
        }
        user.resetToken=token;
        user.resetTokenExpiration=Date.now()+3600000;
        console.log(user.resetToken);
      return user.save();
        
      })
      .then(result=>{
        var string=encodeURIComponent(token);
        console.log("token>>>>>>>>>>>>0 : ",token);
        res.redirect('/'+string);
      })
      .catch(err=>{
        console.log(err);
      })
    });
  };
 
  exports.getNewPassword=(req,res,next)=>{
   const token=req.params.token;
   // console.log("token>>>>>>>>>>>>2 : ",token);
    User.findOne({where:{resetToken:token,resetTokenExpiration:{$gt:Date.now() }}})
    .then(user=>{
          let message=req.flash('error');
          if(message.length >0){
            message=message[0];
          }else{
            message=null;
          }
        res.render('auth/new-password',{
        path:'/new-password',
        pageTitle:'Update Password',
        errorMessage:message,
        userId:req.body.userId,
        passwordToken:token
    });
    })
    .catch(err=>{
      console.log(err);
    })
    
  };
  exports.postNewPassword=(req,res,next)=>{
    const newPassword=req.body.password;
    const userId=req.body.password;
    const passwordToken=req.body.passwordToken;
    let resetUser;
    User.findOne({where:{resetToken:passwordToken}})
    .then(user=>{
      resetUser=user;
      return bcrypt.hash(newPassword,12);
      
    })
    .then(hashedPassword=>{
      resetUser.password=hashedPassword;
      console.log(">>>>>>>>pasword :",hashedPassword)
      resetUser.resetToken=undefined;
      resetUser.resetTokenExpiration=undefined;
      return resetUser.save();
    }).then(result=>{
      res.redirect('/login');
    })
    .catch(err=>{
      console.log(err);
    })
  }