/* global EnvMon */

(function(window, document, $, undefined) {
	'use strict';

	window.EnvMon = window.EnvMon || {};

	EnvMon.Background = {
		config: {
			'server': 'http://dax-dev07:3000'
		},

		init: function() {
			var self = this;

			self.getEnvironments(function(response) {
				if (Object.keys(response.environments).length > 0) {
					EnvMon.Database.set(response, function() {
						console.log('Environments loaded:', response.environments);
					});
				}

				self.check();
			});
		},

		check: function() {
			var self = this;

			EnvMon.Database.get('defaultEnvironment', function(data) {
				console.info('Default environment data loaded', data);
				if (data.defaultEnvironment) {
					self.getEnvData('/server-status?env=' + data.defaultEnvironment.name, function(response) {
						console.info('Default environment services status', response);
						var online = response.some(function(element) {
							return (element.online !== false);
						});
						var obj = {
							'defaultEnvironment': {
								'name': data.defaultEnvironment.name,
								'online': online
							}
						};
						EnvMon.Database.set(obj, function() {
							console.info('Default environment data saved', obj);
							if (obj.defaultEnvironment.online === true) {
								self.setBadge('#21BE11');
							}
							else if (obj.defaultEnvironment.online === false) {
								self.setBadge('#DE0B0B');
							}
							else {
								self.setBadge();
							}
						});
					});
				}
			});

			setTimeout(self.check.bind(self), 8000);
		},

		setBadge: function(color) {
			if (color) {
				chrome.browserAction.setBadgeBackgroundColor({'color': color});
				chrome.browserAction.setBadgeText({'text': ' '});
			}
			else {
				chrome.browserAction.setBadgeText({'text': ''});
			}
		},

		getEnvData: function(query, callback) {
			var self = this;

			$.ajax({
				url: self.config.server + query
			}).success(function(response) {
				callback && callback(response);
			});
		},

		getEnvironments: function(callback) {
			var self = this;

			EnvMon.Database.get('environments', function(data) {
				if (data.environments && Object.keys(data.environments).length > 0) {
					callback && callback(data);
				} else {
					$.ajax({
						url: self.config.server + '/envs'
					}).success(function(response) {
						callback && callback(response);
					});
				}
			});
		}
	};

	window.EnvMon.Database = {
		get: function(key, callback) {
			chrome.storage.local.get(key, function(data) {
				callback && callback(data);
			});
		},

		set: function(object, callback) {
			chrome.storage.local.set(object, function() {
				callback && callback();
			});
		},

		remove: function(key, callback) {
			chrome.storage.local.remove(key, function() {
				callback && callback();
			});
		},

		clear: function(callback) {
			chrome.storage.local.clear(function() {
				callback && callback();
			});
		}
	};

	$(document).ready(function() {
		EnvMon.Background.init();
	});

}(this, this.document, this.jQuery));
