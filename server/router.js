/* Files management */
var read = require('./modules/files/read');
var upload = require('./modules/files/upload');
//var delete = require('./modules/files/delete');

/* User management */
var register = require('./modules/users/register');
var auth = require('./modules/users/auth');

function router()
{
	ExpressApp.get('/:id', function(req, res) {
		read(req, res);
	});

	ExpressApp.get('/silent/:id', function(req, res) {
		read(req, res, true);
	});

	ExpressApp.post('/file/upload', function(req, res)	{
		upload(req, res);
	});

	ExpressApp.post('/file/delete', function(req, res) {
		//delete(req, res);
	});

	ExpressApp.post('/user/register', function(req, res) {
		register(req, res);
	});

	ExpressApp.post('/user/auth', function(req, res) {
		auth(req, res);
	});

	ExpressApp.get('/user/info', function(req, res) {

	});

	ExpressApp.get('/user/uploads', function(req, res) {

	});

	ExpressApp.get('/', function(req, res) {
		res.redirect(301, 'http://usquare.io');
	});
}

module.exports = router;

