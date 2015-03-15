/**
 * sessionAuth
 *
 * @module      :: Policy
 * @description :: Simple policy to allow any authenticated user
 *                 Assumes that your login action in one of your controllers sets `req.session.authenticated = true;`
 * @docs        :: http://sailsjs.org/#!documentation/policies
 *
 */

var actionUtil = require('../../sails/lib/hooks/blueprints/actionUtil');

function validate(Model, paramKey, paramValue, req, res, id, allow, callback) {
	var done = false;

	var doneValid = _.after(res.passed.length, function() {
		done = true;
		return process.nextTick(function() {callback()});
	});

	for(var i=0; i<res.passed.length; ++i) {
		(function(index){
			if(done) {
				return;
			}
			if (Model && Model[allow] && Model[allow][res.passed[index]] && (Model[allow][res.passed[index]]['*'] || Model[allow][res.passed[index]][paramKey])) {
				if (Model[allow][res.passed[index]]['*']) {
					done = true;
					return process.nextTick(function() {callback(paramValue)});
				}
				if (Model.attributes && Model.attributes[paramKey] && (Model.attributes[paramKey].model || Model.attributes[paramKey].collection)) {
					if (Model[allow][res.passed[index]][paramKey].replace) {
						if (paramValue instanceof Object && paramValue.id) {
							done = true;
							return process.nextTick(function() {callback(paramValue.id)});
						} else if (!(paramValue instanceof Object)) {
							done = true;
							return process.nextTick(function() {callback(paramValue)});
						} else {
							doneValid();
						}
					}
					else if (Model[allow][res.passed[index]][paramKey].change) {
						if (Model.attributes[paramKey].model) {
							var model = sails.models[Model.attributes[paramKey].model];
						} else {
							var model = sails.models[Model.attributes[paramKey].collection];
						}
						if (id) {
							Model.findOne({id: id}).populate(paramKey).exec(function(err, foundModel){
								if (err) {
									return res.serverError("Server Error");
								}
								if (!foundModel) {
									done = true;
									return res.send(404);
								}
								return setImmediate(function() {
									validateAll(paramValue, req, res, model, allow, function(data) {
										if(foundModel[paramKey]) {
											data.id = foundModel[paramKey].id;
										}
										done = true;
										return process.nextTick(function() {callback(data)});

									});
								});
							});
						} else {
							return setImmediate(function() {
								validateAll(paramValue, req, res, model, allow, function(data) {
									if(paramValue.id) {
										data.id = paramValue.id;
									}
									done = true;
									return process.nextTick(function() {callback(data)});
								});
							});
						}

					} else {
						doneValid();
					}
				} else {
					done = true;
					return process.nextTick(function() {callback(paramValue)});
				}
			} else {
				doneValid();
			}
		})(i);
	}
}

function validateAll(data, req, res, Model, allow, callback) {
	if (!data) {
		return process.nextTick(callback);
	}
	var ret = {};

	if(Model && data) {
		var keys = Object.keys(data);

		if (keys.length==0) {
			return process.nextTick(function() {callback(ret)});
		}

		var doneValidate = _.after(keys.length, function() {
			return process.nextTick(function() {callback(ret)});
		});

		for(var i=0; i<keys.length; ++i) {
			(function(index){
				return process.nextTick(function() {
					validate(Model, keys[index], data[keys[index]], req, res, data.id, allow, function(data) {
						if (data==undefined || (data.length!=undefined && data.length==0)) {
						} else {
							ret[keys[index]] =  data;
						}
						doneValidate();
					});
				});
			})(i);
		}
	} else {
		return process.nextTick(callback);
	}
}

module.exports = function (req, res, next, trivial) {
	var extendedPassed = [];
	for(var i=0; i<res.passed.length; i++) {
		extendedPassed.push(res.passed[i]);
		if (trivial[res.passed[i]]) {
			for(var j=0; j<trivial[res.passed[i]].length; j++) {
				extendedPassed.push(trivial[res.passed[i]][j]);
			}
		}
	}
	res.passed = _.uniq(extendedPassed);
	//console.log('passed:');
	//console.log(res.passed);
	//console.log('failedPassing:');
	//console.log(res.failedPassing);
    if (res.isAuth) {
		try {
			var Model = actionUtil.parseModel(req);
		}
		catch(err) {

		}
		//console.log('before');
		//if(req.body) {
		//	console.log("body:");
		//	console.log(req.body);
		//}
		//if(req.params) {
		//	console.log("params:");
		//	console.log(req.params);
		//}
		//if(req.query) {
		//	console.log("query:");
		//	console.log(req.query);
		//}

		var doneValidateAll = _.after(1, function() {
			//console.log('after');
			//if(req.body) {
			//	console.log("body:");
			//	console.log(req.body);
			//}
			//if(req.params) {
			//	console.log("params:");
			//	console.log(req.params);
			//}
			//if(req.query) {
			//	console.log("query:");
			//	console.log(req.query);
			//}

			return next();
		});

		// it deleting the params too late, if necessary consider block the whole request
		//validateAll(req.params, req, res, Model, 'allowParams', function(data) {
		//	req.params = data;
		//	doneValidateAll();
		//});
		// probably not necessary, but work well
		//validateAll(req.query, req, res, Model, 'allowParams', function(data) {
		//	req.query = data;
		//	doneValidateAll();
		//});
		validateAll(req.body, req, res, Model, 'allowWrite', function(data) {
			req.body = data;
			doneValidateAll();
		});
    } else {
		return res.forbidden('You are not permitted to perform this action. (code: 0)');
	}
};
