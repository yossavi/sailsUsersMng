/**
 * Authentication Controller
 *
 * This is merely meant as an example of how your Authentication controller
 * should look. It currently includes the minimum amount of functionality for
 * the basics of Passport.js to work.
 */
var AuthController = {

    /**
     * Log out a user and return them to the homepage
     *
     * Passport exposes a logout() function on req (also aliased as logOut()) that
     * can be called from any route handler which needs to terminate a login
     * session. Invoking logout() will remove the req.user property and clear the
     * login session (if any).
     *
     * For more information on logging out users in Passport.js, check out:
     * http://passportjs.org/guide/logout/
     *
     * @param {Object} req
     * @param {Object} res
     */
    logout: function (req, res) {
        req.logout();
        res.ok();
    },

    /**
     * Create a third-party authentication endpoint
     *
     * @param {Object} req
     * @param {Object} res
     */
    provider: function (req, res) {
        passport.endpoint(req, res);
    },

    /**
     * Create a authentication callback endpoint
     *
     * This endpoint handles everything related to creating and verifying Pass-
     * ports and users, both locally and from third-aprty providers.
     *
     * Passport exposes a login() function on req (also aliased as logIn()) that
     * can be used to establish a login session. When the login operation
     * completes, user will be assigned to req.user.
     *
     * For more information on logging in users in Passport.js, check out:
     * http://passportjs.org/guide/login/
     *
     * @param {Object} req
     * @param {Object} res
     */
    callback: function (req, res) {
        var provider = req.param('provider', 'local');
		var appurl = req.get('Referrer') ? req.get('Referrer') : "*";

        function sendError(err) {
            var flashError = req.flash('error')[0];

            if (err && !flashError) {
                console.log(err);
                req.flash('error', 'Error.Passport.Generic');
            } else if (flashError) {
                req.flash('error', flashError);
            }

			if (provider=="local") {
				res.status(401).send(req.flash().error[0]);
			} else {
				res.status(401).send("<script>window.opener.postMessage('" + req.flash().error[0] + "', '"+appurl+"');close();</script>");
			}
        }

        passport.callback(req, res, function (err, user) {
            if (err) {
                return sendError(err);
            }

            req.login(user, function (err) {
                if (err) {
                    return sendError(err);
                }

				if (provider=="local") {
					res.ok(user);
				} else {
					res.ok("<script>window.opener.postMessage('ok', '"+appurl+"');close();</script>");
				}
            });
        });
    },

    /**
     * Disconnect a passport from a user
     *
     * @param {Object} req
     * @param {Object} res
     */
    disconnect: function (req, res) {
        passport.disconnect(req, res);
    }
};

module.exports = AuthController;
