/* global EnvMon */

(function(window, document, $, undefined) {
	'use strict';

	window.EnvMon = window.EnvMon || {};

	EnvMon.Background = {
		config: {
			'server': ''
		},

		setup: function() {
			var self = this;

			EnvMon.Database.get('defaultServer', function(data) {
				if (data.defaultServer && data.defaultServer.addr) {
					self.config.server = data.defaultServer.addr;
					self.init();
				}
				else {
					console.warn('No API defined! Unable to get data.');
				}
			});

		},

		init: function() {
			var self = this;

			self.getData('/envs', function(response) {
				if (Object.keys(response).length > 0) {
					EnvMon.Database.set({'environments': response}, function() {
						console.log('Environments loaded:', response);
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
					self.getData('/server-status?env=' + data.defaultEnvironment.name, function(response) {
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

		getData: function(query, callback) {
			var self = this;

			$.ajax({
				url: self.config.server + query
			}).success(function(response) {
				callback && callback(response);
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
		EnvMon.Background.setup();
	});

}(this, this.document, this.jQuery));
