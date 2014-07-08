(function(window, document, $, Ashe, undefined) {
	'use strict';

	var DAxMon = DAxMon || {};

	DAxMon.CONFIG = {
		'server': 'http://dax-dev07:3000'
	};

	DAxMon.App = {

		init: function() {
			var self = this;
			var environments;
			var config = {
				'containers': {
					'main': $('#render-container')
				},
				'templates': {
					'main': $('#template-envs').html(),
					'packages': $('#template-packages').html(),
					'status': $('#template-status').html()
				}
			};

			self.getEnvironments(function(response) {
				environments = response.environments;
				self.render(config.templates.main, config.containers.main, {'environments': environments});

				var keys = Object.keys(environments);

				keys.forEach(function(key) {
					self.getData('/packages?env=' + environments[key].name, function(response) {
						var container = $('#package-' + environments[key].name);
						self.render(config.templates.packages, container, {'packages': response});

						self.getData('/server-status?env=' + environments[key].name, function(response) {
							var container = $('#status-' + environments[key].name);
							self.render(config.templates.status, container, {'status': response});
						});
					});
				});
			});
		},

		getEnvironments: function(callback) {
			$.ajax({
				url: DAxMon.CONFIG.server + '/envs'
			}).success(function(response) {
				callback(response);
			});
		},

		render: function(template, container, data) {
			var rendered = Ashe.parse(template, data);
			container.html(rendered);
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