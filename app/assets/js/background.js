/* global DAxMon */

(function(window, document, $, Ashe, undefined) {
	'use strict';

	window.DAxMon = window.DAxMon || {};

	DAxMon.Background = {
		config: {
			'server': 'http://dax-dev07:3000'
		},

		init: function() {
			var self = this;

			self.getEnvironments(function(response) {
				if (Object.keys(response.environments).length > 0) {
					DAxMon.Database.set(response, function() {
						console.log('Environments loaded:', response.environments);
					});
				}

				self.check();
			});
		},

		check: function() {
			var self = this;

			DAxMon.Database.get('defaultEnvironment', function(data) {
				if (data.defaultEnvironment) {
					self.getEnvData('/server-status?env=' + data.defaultEnvironment.name, function(response) {
						var obj = {
							'defaultEnvironment': {
								'name': data.defaultEnvironment.name,
								'status': (response.apacheStatus.status === 'running' && response.tomcatStatus.status === 'running') ? 'up' : 'down'
							}
						};
						DAxMon.Database.set(obj, function() {
							if (obj.defaultEnvironment.status === 'up') {
								self.setBadge('#21BE11');
							} else {
								self.setBadge('#DE0B0B');
							}
						});
					});
				}
			});

			setTimeout(self.check.bind(self), 8000);
		},

		setBadge: function(color) {
			chrome.browserAction.setBadgeBackgroundColor({'color': color});
			chrome.browserAction.setBadgeText({'text': ' '});
		},

		render: function(template, container, data, callback) {
			var rendered = Ashe.parse(template, data);
			container.html(rendered);
			if (callback) {
				callback();
			}
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
		},

		getEnvData: function(query, callback) {
			var self = this;

			jQuery.ajax({
				url: self.config.server + query
			}).success(function(response) {
				if (response.hostAddress) {
					delete response.hostAddress;
				}
				callback(self.beautify(response));
			});
		},

		getEnvironments: function(callback) {
			var self = this;

			DAxMon.Database.get('environments', function(data) {
				if (data.environments && Object.keys(data.environments).length > 0) {
					callback(data);
				} else {
					jQuery.ajax({
						url: self.config.server + '/envs'
					}).success(function(response) {
						callback(response);
					});
				}
			});
		}
	};

	window.DAxMon.Database = {
		get: function(key, callback) {
			chrome.storage.local.get(key, function(data) {
				if (callback) {
					callback(data);
				}
			});
		},

		set: function(object, callback) {
			chrome.storage.local.set(object, function() {
				if (callback) {
					callback();
				}
			});
		},

		remove: function(key, callback) {
			chrome.storage.local.remove(key, function() {
				if (callback) {
					callback();
				}
			});
		},

		clear: function(callback) {
			chrome.storage.local.clear(function() {
				if (callback) {
					callback();
				}
			});
		}
	};

	$(document).ready(function() {
		DAxMon.Background.init();
	});

}(this, this.document, this.jQuery, this.Ashe));
