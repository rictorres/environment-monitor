(function(window, document, $, Ashe, undefined) {
	'use strict';

	var DAxMon = DAxMon || {};

	DAxMon.CONFIG = {
		'server': 'http://dax-dev07:3000',
		'environments': [
			{
				'name': 'dax-dev01',
				'label': 'DEV01',
				'addr': '10.11.57.42'
			},
			{
				'name': 'dax-dev03',
				'label': 'DEV03',
				'addr': '10.11.57.82'
			},
			{
				'name': 'dax-dev05',
				'label': 'DEV05',
				'addr': '10.11.57.202'
			},
			{
				'name': 'dax-dev07',
				'label': 'DEV07',
				'addr': '10.11.57.222'
			},
			{
				'name': 'qa01',
				'label': 'QA01',
				'addr': '10.11.11.185'
			},
			{
				'name': 'qa03',
				'label': 'QA03',
				'addr': '10.11.21.185'
			},
			{
				'name': 'qa04',
				'label': 'QA04',
				'addr': '10.11.22.185'
			},
			{
				'name': 'qa05',
				'label': 'QA05',
				'addr': '10.11.23.105'
			}
		]
	};

	DAxMon.App = {

		init: function() {
			var self = this;
			var environments = DAxMon.CONFIG.environments;
			var $container = $('#render-container');
			var counter = 0;

			environments.forEach(function(env) {
				self.getData('/packages?env=' + env.name, function(response) {
					env.packages = response;

					self.getData('/server-status?env=' + env.name, function(response) {
						env.serverStatus = response;

						counter++;
						if (counter === environments.length) {
							// console.log('envs', {'environments': environments});
							self.render($container, {'environments': environments});
						}

					});

				});
			});
		},

		render: function($container, data) {
			var template = $('#template-envs').html();
			var rendered = Ashe.parse(template, data);
			$container.html(rendered);
		},

		getData: function(query, callback) {
			var self = this;

			$.ajax({
				url: DAxMon.CONFIG.server + query
			}).success(function(response) {
				if (response.hostAddress) {
					delete response.hostAddress;
				}
				callback(self.beautify(response));
			});
		},

		beautify: function(response) {
			var newResponse;

			if ('apacheStatus' in response && 'tomcatStatus' in response) {
				newResponse = {};
				for (var processStatus in response) {
					var notRunning = /NOT_RUNNING/gi.test(response.processStatus);
					newResponse[processStatus] = {
						'class': (notRunning ? 'danger' : 'success'),
						'status': (notRunning ? 'stopped' : 'running')
					};
				}
				return newResponse;
			}
			else if ('packages' in response) {
				newResponse = [];
				var regex = /\.noarch/gi;
				var packagesData = response.packages.replace(/\r?\n|\r/g, '').split(regex);

				for (var i = 0, len = packagesData.length; i < len; i++) {
					if (packagesData[i] === '') {
						continue;
					}
					var formatted = {};
					var index;
					var splittedPackageName = packagesData[i].split('-');

					formatted.branch = splittedPackageName[3];
					formatted.revision = splittedPackageName[4];

					if (splittedPackageName[1] === 'core') {
						switch(splittedPackageName[2]) {
							case 'server':
								formatted.repo = 'Server';
								index = 0;
								break;
							case 'gui':
								formatted.repo = 'GUI';
								index = 1;
								break;
							case 'mui':
								formatted.repo = 'Focus';
								index = 2;
								break;
						}
					} else if (splittedPackageName[1] === "dashboards") {
						formatted.repo = 'Dashboards';
						index = 3;
					}
					newResponse[index] = formatted;
				}
				return newResponse;
			}
		}
	};

	$(document).ready(function() {
		DAxMon.App.init();
	});


}(this, this.document, this.jQuery, this.Ashe));