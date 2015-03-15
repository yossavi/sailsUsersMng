/**
 * Created by yossi on 1/24/2015.
 */
module.exports = {
	schema: true,
	allowWrite: {
		public: {identifier: true, password: true, firstname: true, usermail: true, provider: true, code: true},
		superAdmin: {'*': true}
	}
};