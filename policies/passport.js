/**
 * Passport Middleware
 *
 * Policy for Sails that initializes Passport.js and as well as its built-in
 * session support.
 *
 * In a typical web application, the credentials used to authenticate a user
 * will only be transmitted during the login request. If authentication
 * succeeds, a session will be established and maintained via a cookie set in
 * the user's browser.
 *
 * Each subsequent request will not contain credentials, but rather the unique
 * cookie that identifies the session. In order to support login sessions,
 * Passport will serialize and deserialize user instances to and from the
 * session.
 *
 * For more information on the Passport.js middleware, check out:
 * http://passportjs.org/guide/configure/
 *
 * @param {Object}   req
 * @param {Object}   res
 * @param {Function} next
 */

module.exports = function (req, res, next) {
	res.passed = [];
	res.failedPassing = [];
	res.toJson = res.json;
	if (req.query && req.query.populate && !(req.query.populate instanceof Array)) {
		req.query.populate = [req.query.populate];
	}

	res.json = function(data) {
		var afterSend = function(obj, callback){
			var keys = Object.keys(obj);
			var active = function(i) {
				if(keys.length==i) {
					delete obj._activeted_;
					process.nextTick(callback);
				} else {
					setImmediate(function() {
						activeBeforeSend(obj[keys[i]], keys[i], function() {
							process.nextTick(function() {active(i+1)});
						});
					});
				}
			}
			active(0);
		}

		var activeBeforeSend = function (obj, key, callback) {
			if (obj instanceof Object && (key=='first' || !isNaN(key) || req.route.method!='get' || (req.query && req.query.populate && req.query.populate.indexOf(key)!=-1))) {
				if(obj._activeted_) {
					return;
				}
				obj._activeted_ = true;
				if(obj.beforeSend) {
					obj.beforeSend(req, res, data, function(data) {
						process.nextTick(function() {afterSend(obj, callback)});
					});
				} else {
					process.nextTick(function() {afterSend(obj, callback)});
				}
			} else {
				process.nextTick(callback);
			}
		}

		activeBeforeSend(data, 'first', function() {
			res.toJson(data);
		});

	}
};
