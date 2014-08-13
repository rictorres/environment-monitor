/* global EnvMon */

(function(window, document, $, undefined) {
	'use strict';

	window.EnvMon = window.EnvMon || {};

	EnvMon.Background = {
		timer: null,
		checkTimeout: 8000,
		maxCheckCount: 4,
		errorCounter: 0,

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
						self.errorCounter = 0;
						self.checkTimeout = 8000;
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
						if (data.defaultEnvironment.online !== obj.defaultEnvironment.online) {
							EnvMon.Database.set(obj, function() {
								var notificationOptions = {
									type: 'basic',
									title: 'Environment status has changed',
								};

								if (obj.defaultEnvironment.online) {
									notificationOptions.message = data.defaultEnvironment.name + ' is now online';
									notificationOptions.iconUrl = '/assets/images/icon-green-128.png';
								} else {
									notificationOptions.message = data.defaultEnvironment.name + ' is now offline';
									notificationOptions.iconUrl = '/assets/images/icon-red-128.png';
								}

								chrome.notifications.create('', notificationOptions, function(id) {
									console.log('notification!', id);
								});
							});
						}

						var imageOptions = {
							path: {}
						};

						if (obj.defaultEnvironment.online) {
							imageOptions.path['19'] = '/assets/images/icon-green-19.png';
							imageOptions.path['38'] = '/assets/images/icon-green-38.png';
							chrome.browserAction.setIcon(imageOptions);
						} else {
							imageOptions.path['19'] = '/assets/images/icon-red-19.png';
							imageOptions.path['38'] = '/assets/images/icon-red-38.png';
							chrome.browserAction.setIcon(imageOptions);
						}
					},
					function(error) {
						self.errorCounter++;

						if (self.errorCounter === self.maxCheckCount) {
							self.errorCounter = 0;
							self.checkTimeout = 30000;

							var notificationOptions = {
								type: 'basic',
								title: 'Environment status error',
								message: data.defaultEnvironment.name + ' status cannot be retrieved due to an error' + (error ? ': ' + error : '.'),
								iconUrl: '/assets/images/icon-red-128.png'
							};

							chrome.notifications.create('', notificationOptions, function(id) {
								console.log('notification!', id);
							});
						}
					});
				}
			});

			clearTimeout(self.timer);
			self.timer = setTimeout(self.check.bind(self), self.checkTimeout);
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

		getData: function(query, callback, errCallback) {
			var self = this;

			$.ajax({
				url: self.config.server + query
			}).success(function(response) {
				callback && callback(response);
			}).error(function(error, status, message) {
				errCallback && errCallback(message);
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
