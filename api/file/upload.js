var chance = require('chance');

var auth = require('../user/auth/connect_auth');

var resolver = require('../../resolver');
var tools = require('../../tools');

/* Controller */
function upload(req, res)
{
    var file = req.files.file;
    var version = req.body.version;
    var credentials = req.body;

    if (!tools.exist(file))
    {
        res(true, tools.error(561, 'There is no files inside the request'));
        return;
    }

    var callback = function (err, result)
    {
        if (err != null)
        {
            res(true, tools.error(550, 'An error occurred'));
            return;
        }

        res(null, Config.baseUrl + result.ops[0].shortName);
    };

    if (tools.exist(req.body.accountKey))
    {
        auth.getUserFromAuth(credentials, function (err, author)
        {
            if (err != null)
            {
                res(true, tools.error(551, 'Check your credentials'));
                return;
            }

            insertNewFile(file, author, version, callback);
        });

        return;
    }

    insertNewFile(file, null, version, callback);

}

function insertNewFile(file, author, version, callback)
{
    var db = resolver.resolve('db');
    var files = db.collection('files');
    var users = db.collection('users');

    var shortName = chance(Date.now()).string(Config.fileOptions);

    files.insert(
    {
        shortName: shortName,
        originalName: file.originalname,
        name: file.name,
        encoding: file.encoding,
        mimetype: file.mimetype,
        extension: file.extension,
        size: file.size,
        password: null,
        views: 0,
        receivedAt: tools.timestamp(),
        usquareVersion: undefined,
        author: author,
        version: version
    }, function (err, result)
    {
        if (err != null)
        {
            callback(err, null);
            return;
        }

        callback(null, result);

        if (author == undefined)
            return;

        users.update(
        {
            _id: author
        },
        {
            $inc:
            {
                nOfFilesSaved: 1
            }
        });
    });
}

exports.upload = upload;

