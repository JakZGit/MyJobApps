var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var storage = require('Database');

var obj = {};

router.get('/dashboard',function(req, res,next) {
  if(req.user){
  	storage.user.findOne({_id:req.user._id},function(err,user){
		if(err)
			console.log(err);
		if(user){
			//for some reason user.employeesList is being returned a big object({obj},{obj},...}) rather than an array of obj ([{obj},{obj}])
			//as it was intended it to be
			//convert it to array here
			//var temp = Array.prototype.slice.call(user.jobList, 0);
			// var temp = [];
			// console.log(temp);
			storage.jobList.find({},function(err,list){

				if(err)
					console.log(err);
				if(list){
					obj.job_infos = [];
					//create and array and store objs
					var job_info = [];
					for(var j in user.jobs){
						for(var i in list){
							if(list[i]._id.equals(user.jobs[j])){
								 console.log("INSIDE JOBS = LIST");
								try{
									var job_obj = {
										_id: list[i]._id,
										company: list[i].company,
										position: list[i].position,
										descriptionLink: list[i].descriptionLink,
										registerDate: list[i].registerDate,
									};
									console.log("THIS IS JOB OBJ " +list[i]._id);
									job_info.push(job_obj);
								}
								catch(err){
									console.log(err);
								}
								break;
							}
						}
					}
					obj.job_infos = job_info;
				}
				console.log("THIS IS OBJ: " + obj.job_infos);
				obj.user = req.user;
				res.render('home',obj);
			});
		}
	});
  }
  else
	res.redirect('/');

});

router.post('/add',function(req,res,next){
	storage.user.findOne({_id:req.user._id},function(err,user){
		if(err)
			console.log(err);
		if(user){
			var jobDescrip = new storage.jobList({
				company : req.body.name,
				position : req.body.position,
				descriptionLink : req.body.descriptionLink,
			});
			jobDescrip.save();
			console.log("ADDING JOB DESCRIPT ID " +jobDescrip._id);
			user.jobs.push(jobDescrip._id);
			user.save();
		}
		res.redirect("/");
	});
});


router.post('/remove/:id',function(req,res,next){
	storage.user.findOne({_id:req.user._id},function(err,user){
		//remove id from reference array that points to jobList
		var left = user.jobs.slice(0, user.jobs.indexOf(req.params.id));
		var right = user.jobs.slice(user.jobs.indexOf(req.params.id)+1);
		user.jobs = left.concat(right);
		user.save();
		storage.jobList.findOneAndRemove({_id:req.params.id},function(err,removed){
			if(err)
				console.log(err);
			res.redirect("/");

		});
	});
});



module.exports = router;
