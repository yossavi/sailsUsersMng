/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
    me: function (req, res) {
		res.passed.push('curUser');
		res.send(req.user);
    }
};

