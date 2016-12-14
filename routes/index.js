var express = require('express');
var mongoose = require('mongoose');
var storage = require('Database');
var router = express.Router();
var passport = require('passport'), LocalStrategy = require('passport-local').Strategy;
var flash =  require('connect-flash');

//functions should be on top
var isAuthenticated = function(req,res,next){
	if(req.isAuthenticated())
		return next;
	res.redirect('/');
};


var obj= {};
/* GET home page. */
router.get('/', function(req, res, next) {
	if(req.user)
		res.redirect('/users/dashboard')
	else
		res.render('index');
});





//login is strategy name
router.post('/login',passport.authenticate('login',{
	successRedirect: '/users/dashboard',
	failureRedirect: '/',
	failureFlash : true
}));

router.get('/signup',function(req,res){
	res.render('register',{message:req.flash('message')});
});

router.post('/signup',passport.authenticate('signup',{
	successRedirect: '/users/dashboard',
	failureRedirect: 'back',
	failureFlash: true
	})
)





router.get('/signout',function(req,res){
	req.logout();
	res.redirect('/');
});

module.exports = router;
