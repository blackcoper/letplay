var util = require('../library/util');
var data = module.exports = {};
data.users = {};
data.users.target_model = '../models/user';
data.users.data = new Array({username:'admin',name:'admin letplay',email:'admin_letplay@maxsolution.net',password:util.encrypt('43lw9rj2'),group:'admin'});
