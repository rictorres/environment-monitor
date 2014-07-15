(function(window, document, $, Ashe, undefined) {
	'use strict';

	var DAxMon = DAxMon || {};

	DAxMon.CONFIG = {
		'server': 'http://dax-dev07:3000'
	};

	DAxMon.App = {
		environments: {},

		init: function() {
			var self = this;
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
				self.environments = response.environments;
				self.render(config.templates.main, config.containers.main, {'environments': self.environments});

				var env = 0,
					keys = Object.keys(self.environments);

				keys.forEach(function(key) {
					self.getData('/packages?env=' + self.environments[key].name, function(response) {
						var container = $('#package-' + self.environments[key].name);
						self.environments[key].data = response;
						self.render(config.templates.packages, container, {'packages': response});

						env++;
						if (env === keys.length) {
							self.enhanceEnvironments();
						}

						self.getData('/server-status?env=' + self.environments[key].name, function(response) {
							var container = $('#status-' + self.environments[key].name);
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

		enhanceEnvironments: function() {
			var self = this,
				latestRevisionNumbers = { //number, count
					'Server': [0, 0],
					'GUI': [0, 0],
					'Focus': [0, 0],
					'Dashboards': [0, 0]
				};

			function getLatestRevisionNumber(env) {
				for (var i = env.data.length - 1; i >= 0; i--) {
					var revision = parseInt(env.data[i].revision),
						latest = latestRevisionNumbers[env.data[i].repo];

					if (revision > latest[0]) {
						latestRevisionNumbers[env.data[i].repo] = [revision, 1];
					} else if (revision === latest[0]) {
						latestRevisionNumbers[env.data[i].repo][1]++;
					}
				}
			}

			function checkForLatestAndUniqueRevisions(env) {
				var isPackageModified = false,
					isEnvModified = false;

				for (var i = env.data.length - 1; i >= 0; i--) {
					var latest = latestRevisionNumbers[env.data[i].repo];

					if (parseInt(env.data[i].revision) === latest[0]) {
						env.data[i].latest = true;
						isPackageModified = true;

						if (latest[1] === 1) {
							env.data[i].unique = true;
							env.hasUnique = true;
							isEnvModified = true;
						}
					}
				}

				if (isPackageModified) {
					self.render($('#template-packages').html(), $('#package-' + env.name), {'packages': env.data});
				}
				if (isEnvModified) {
					self.render($('#template-envs').html(), $('#render-container'), {'environments': self.environments});
					renderPackages();
				}
			}

			function checkForPerfectEnvironments(env) {
				for (var i = env.data.length - 1; i >= 0; i--) {
					if (!env.data[i].latest) {
						return;
					}
				}

				env.onFire = true;
				self.render($('#template-envs').html(), $('#render-container'), {'environments': self.environments});
				renderPackages();
			}

			function renderPackages() {
				for (var key in self.environments) {
					var env = self.environments[key];
					self.render($('#template-packages').html(), $('#package-' + env.name), {'packages': env.data});
				}
			}

			for (var key1 in this.environments) {
				getLatestRevisionNumber(this.environments[key1]);
			}

			for (var key2 in this.environments) {
				checkForLatestAndUniqueRevisions(this.environments[key2]);
			}

			for (var key3 in this.environments) {
				checkForPerfectEnvironments(this.environments[key3]);
			}
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
					} else if (splittedPackageName[1] === 'dashboards') {
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
