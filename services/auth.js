/**
 * Created by yossi on 1/22/2015.
 */
module.exports = {

	toJSON: function(thisObj) {
		var ret = {id: thisObj.id};

		if (thisObj.allowedRead) {
			for(var i=0; i<thisObj.allowedRead.length; ++i) {
				if (thisObj.allowedRead[i] == '*') {
					var keys = Object.keys(thisObj);
					for(var j=0; j<keys.length; ++j) {
						if(thisObj[keys[j]] instanceof Object && thisObj.allowedRead.indexOf(keys[j])==-1 && thisObj.routeMethod=='get' && !_.isDate(thisObj[keys[j]])) {
							delete thisObj[keys[j]];
						} else if(thisObj[keys[j]] instanceof Array && thisObj[keys[j]].length==0 && thisObj.allowedRead.indexOf(keys[j])==-1) {
							delete thisObj[keys[j]];
						}
					}
					delete thisObj.allowedRead;
					delete thisObj.routeMethod;

					return thisObj;
				}
				ret[thisObj.allowedRead[i]] = thisObj[thisObj.allowedRead[i]];
			}
		}
		
		return ret;
	},
	updateAllow: function(thisObj, req, res) {
		thisObj.allowedRead = [];
		thisObj.routeMethod = req.route.method;

		for(var i=0; i<res.passed.length; ++i) {
			if (thisObj.allowRead) {
				var allowRead = thisObj.allowRead();
				if (allowRead[res.passed[i]]) {
					for (var j = 0; j < allowRead[res.passed[i]].length; ++j) {
						if (allowRead[res.passed[i]][j] == '*') {
							thisObj.allowedRead = thisObj.allowedRead.concat(req.query.populate);
						}
						thisObj.allowedRead.push(allowRead[res.passed[i]][j]);
					}
				}
			}
		}
	}
};