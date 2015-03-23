# sailsUsersMng

this library can be integrated in sails projects, in order to help manage and authenticate users, and every read/write action of them.
this library using passport.js

##installation

add to your package.json file, the line:
```Cycript
"sailsUsersMng": "git://github.com/yossavi/sailsUsersMng.git"
```
run in terminal:
```
npm install
```
add the following files to your sails project:
* .../api/controllers/AuthController.js with the code:
```Cycript
module.exports = require('sailsUsersMng/controllers/AuthController');
```
* .../api/controllers/UserController.js with the code:
```Cycript
module.exports = require('sailsUsersMng/controllers/UserController');
```
* .../api/models/Auth.js with the code:
```Cycript
module.exports = require('sailsUsersMng/models/Auth');
```
* .../api/models/Passport.js with the code:
```Cycript
module.exports = require('sailsUsersMng/models/Passport');
```
* .../api/policies/passport.js with the code:
```Cycript
module.exports = function (req, res, next) {
	require('sailsUsersMng/policies/passport')(req, res, next);
    passport.initialize()(req, res, function () {
        passport.session()(req, res, function () {
	        res.isAuth = false;
	        if (req.user) {
		        User.findOne({id: req.user.id}).exec(function(err, user) {
			        if (err) {
				        return res.serverError("Server Error");
			        }

					req.user = user;
					next();
		        });
	        } else {
		        next();
	        }
        });
    });
};
```
* .../api/policies/result.js with the code:
```Cycript
module.exports = function (req, res, next) {
	var trivial = {
		superAdmin: ['admin', 'curUser', 'public', 'user'],
		admin: ['curUser', 'public', 'user'],
		curUser: ['public', 'user'],
		user: ['public']
	}
	require('sailsUsersMng/policies/result')(req, res, next, trivial);
};
```
* .../api/services/auth.js with the code:
```Cycript
var auth = require('sailsUsersMng/services/auth');
auth.policy = function(allowedArr, req, res, callback, ids, isFailSend) {
  ...
}
module.exports = auth;
```
* .../api/services/passport.js with the code:
```Cycript
module.exports = require('sailsUsersMng/services/passport');
```

add the following code to your sails files:
* .../config/bootstrap.js with the code:
```Cycript
module.exports.bootstrap = function (cb) {
	sails.services.passport.loadStrategies();
	cb();
};
```
* .../config/local.js with the code:
```Cycript
module.exports = {
	proxyHost: 'YOUR_SERVER_URL'
};
```

* .../config/passport.js with the code:
```Cycript
module.exports.passport = {
  local: {
    strategy: require('passport-local').Strategy
  },

  twitter: {
    name: 'Twitter',
    protocol: 'oauth',
    strategy: require('passport-twitter').Strategy,
    options: {
      consumerKey: '...',
      consumerSecret: '...'
    }
  },

  facebook: {
    name: 'Facebook',
    protocol: 'oauth2',
    strategy: require('passport-facebook').Strategy,
    options: {
      clientID: '...',
      clientSecret: '...'
    },
    scope: ['email', 'public_profile']
  },

  google: {
    name: 'Google',
    protocol: 'oauth2',
    strategy: require('passport-google-oauth').OAuth2Strategy,
    options: {
      clientID: '...',
      clientSecret: '...'
    },
    scope: ['https://www.googleapis.com/auth/plus.login', 'https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/plus.me']
  }
};
```

* .../config/policies.js with the code:
```Cycript
module.exports.policies = {
	'*': ['passport', 'superAdmin', 'result'],
	SOMEController: {
		find: ['passport', 'superAdmin', 'SOME_POLICY', 'result'],
		findOne: ['passport', 'superAdmin', 'result'],
		create: ['passport', 'superAdmin', 'result'],
		update: ['passport', 'superAdmin', 'ANOTHER_POLICY', 'result'],
		destroy: ['passport', 'superAdmin', 'result'],
		populate: ['passport', 'superAdmin', 'result'],
		add: ['passport', 'superAdmin', 'result'],
		remove: ['passport', 'superAdmin', 'result']
	}
};
```

* .../config/routes.js with the code:
```Cycript
module.exports.routes = {
	'post /auth/local': 'AuthController.callback',
    'post /auth/local/:action': 'AuthController.callback',

    'get /auth/logout': 'AuthController.logout',
    'get /auth/:provider': 'AuthController.provider',
    'get /auth/:provider/callback': 'AuthController.callback',
    'get /auth/:provider/:action': 'AuthController.callback'
};
```

## TODO
* explain the required configuration needed in policies folder
* explain the required configuration needed in every model
* add the package to npm

##Contact
if you want to get more information, explanation or help, please contact me

thanks.
