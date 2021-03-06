'use strict';

let path = require('path');
let File = require('./models/file');
let User = require('./../users/models/user');
let Stats = require('./../stats/models/stats');

/* This controller handle all request that match '/:id'
 * It's usually the route used to see a file
 * So we get the file and return it.
 * Silent is an optionnal parameter. If it is true, we do not increment the counter of the file.
 */
function read(req, res, silent)
{
	// Find the file
	File.findOne({ 'shortName': req.params.id, available: true }, function(err, file)
	{
		if(handleError(err))
		{
			res.serverError(err);
			return;
		}
		
		if(!file)
		{
			res.status(404).send('Could not find your file.');
			return;
		}
		
		if(file.password)
		{
			if(!req.params.password || file.password !== req.params.password)
			{
				res.status(403).send('You\'re not authorized to get this file.');
				return;
			}
		}

		let filePath = path.resolve(Config.files.destination + file.fileName);

		const options = {};
		options.lastModified = false;
		options.headers = { 'Content-Disposition': `inline; filename="${file.originalFileName}"` };

		res.sendFile(filePath, options, function(err)
		{
			if(handleError(err))
			{
				
				return res.serverError(res);
			}

			// Increment views counters
			if(!silent)	file.incrementViewNumber();
			else file.incrementSilentViewNumber();
			
			file.save(function(err) { handleError(err); });
			
			if(!silent && file.author)
			{
				User.findOne({ _id: file.author }, function(err, author)
				{					
					if(handleError(err)) return;
					
					if(!author) return;

					author.incrementNumberOfViews();
					author.save(function(err) { handleError(err) });
				});
			}

			/* Let's update stats */
			Stats.findOne(function(err, stats)
			{
				if(handleError(err)) return;

				++stats.views.total;

				if(!silent) ++stats.views.notSilent;
				else ++stats.views.silent;

				stats.save(function(err) { handleError(err); });
			});
		});
	});
}

module.exports = read;