const Product = require('../models/product');
const user=require('../models/user');
const { validationResult }=require('express-validator/check');
exports.getAddProduct = (req, res, next) => {
  
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false,
    hasError:false,
    errorMessage:null,
    validationErrors:[]
    
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  const errors=validationResult(req);
  if(!errors.isEmpty()){
    res.status(422).render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/edit-product',
      editing: false,
      hasError:true,
      product: {
        title:title,
        imageUrl:imageUrl,
        price:price,
        description:description
      },
      errorMessage:errors.array()[0].msg,
      validationErrors:errors.array()
      
    });
  }
  // const product = new Product(null, title, imageUrl, description, price);
  // product.save().then(
  //   ()=>{
  //     res.redirect('/');
  //   }
  // ).catch(err=>{
  //   console.log(err);
  // });
  req.user
  .createProduct({
      title:title,
      imageUrl: imageUrl,
      price:price,
      description:description,
      userId:req.user
    })
  .then(result=>{
    console.log('Created Product');
    res.redirect('/admin/products');
  })
  .catch(err=>{
    const error=new Error(err);
    error.httpStatusCode=500;
    return next(error);  })
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/');
  }
  const prodId = req.params.productId;
  req.user.getProducts({where:{id:prodId}})
.then(products => {
  //throw new Error("qwerty");
  const product=products[0];
    if(!product){
      return res.redirect('/');
    }
    res.render('admin/edit-product', {
      pageTitle: 'Edit Product',
      path: '/admin/edit-product',
      editing: editMode,
      product: product,
      hasError:false,
      errorMessage:null,
      validationErrors:[]
      
    });
  })
  .catch(err=>{
    const error=new Error(err);
    error.httpStatusCode=500;
    return next(error);
  });
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const updatedImageUrl = req.body.imageUrl;
  const updatedDesc = req.body.description;
  const errors=validationResult(req);
  if(!errors.isEmpty()){
            res.status(422).render('admin/edit-product', {
              pageTitle: 'Edit Product',
              path: '/admin/edit-product',
              editing: true,
              hasError:true,
              product: {
                title:updatedTitle,
                imageUrl:updatedImageUrl,
                price:updatedPrice,
                description:updatedDesc,
                id:prodId
              },
              errorMessage:errors.array()[0].msg,
              validationErrors:errors.array()
              
            });
  }


  Product.findByPk(prodId)
  .then(product=>{
    if(product.userId!==req.session.user.id){
      return res.redirect('/');
    }
    product.title=updatedTitle;
    product.price=updatedPrice;
    product.imageUrl=updatedImageUrl;
    product.description=updatedDesc;
    return product.save();
  })
  .then(result=>{
    console.log("Updated Product !!>>>>>....");
    res.redirect('/admin/products');
  })
  .catch(err=>{
    const error=new Error(err);
    error.httpStatusCode=500;
    return next(error); 
   });
 
};

exports.getProducts = (req, res, next) => {
  
  req.user.getProducts(req.session.user.id).then(products=>{
    res.render('admin/products', {
           prods: products,
           pageTitle: 'Admin Products',
           path: '/admin/products',
           
  });
  })
  .catch((err)=>{
    const error=new Error(err);
    error.httpStatusCode=500;
    return next(error);  }); 
};

exports.deleteProduct=(req,res,next)=>{
  prodId=req.params.productId;
  Product.findByPk(prodId)
  .then(product=>{
    return product.destroy();
  })
  .then(result=>{
    console.log(" Pro duct DEstroyed.>>");
    res.status(200).json({message:"Sucess"});
    // res.redirect('/admin/products');
  })
  .catch(err=>{
    res.status(500).json({message:"Deleting Failed"});
  })
  
};






