const express = require('express');
const { check ,body}=require('express-validator/check');
const authController=require('../controllers/auth');
const User=require('../models/user');
const router = express.Router();

router.get('/login',authController.getLogin);

router.post(
  '/login',
  [
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email address.')
      .normalizeEmail(),
    body('password', 'Password has to be valid.')
      .isLength({ min: 5 })
      .isAlphanumeric()
      .trim()
  ],
  authController.postLogin
);
router.get('/signup',authController.getSignup);

router.post(
    '/signup',
[
check('email')
.isEmail()
.withMessage('please enter a valid email')
.custom((value, {req}) => {

//     if (value ==='test@test.com'){

//     throw new Error ('this email is forbidden');

// }

// return true;



return User.findOne({where:{email:value} })
  .then(userDoc=>{
    if(userDoc){
        return Promise.reject('email is forbidden ');      }
});
})
.normalizeEmail(),
body('password','please enter a valid password amigo')
.isLength({min: 5})
.isAlphanumeric()
.trim(),

body('confirmPassword').trim().custom((value, {req}) => {

    if(value !== req.body.password) {

        throw new Error('Passwords have to match');

    }

    return true;

})

],

authController.postSignup);

router.post('/logout',authController.postLogout);
router.get('/reset',authController.getReset);
router.post('/reset',authController.postReset);
router.get('/:token',authController.getNewPassword);
router.post('/new-password',authController.postNewPassword);
module.exports=router;