(function(window, document, $, Ashe, angular, undefined) {
	'use strict';

	angular
		.module('EnvMonitor', []);

	var EnvMonitor = angular.module('EnvMonitor');

	EnvMonitor
		.factory('Database', [function() {
			return chrome.extension.getBackgroundPage().DAxMon.Database;
		}])

		.factory('Background', [function() {
			return chrome.extension.getBackgroundPage().DAxMon.Background;
		}])

		.controller('PopupCtrl', ['$scope', 'Background', function ($scope, Background) {
			$scope.loading = true;

			Background.getEnvironments(function(response) {
				$scope.environments = response.environments;

				var envCounter = 0,
					keys = Object.keys(response.environments);

				keys.forEach(function(key) {
					Background.getEnvData('/packages?env=' + response.environments[key].name, function(response) {
						$scope.environments[key].data = response;

						envCounter++;
						if (envCounter === keys.length) {
							//self.enhanceEnvironments(config);
							$scope.loading = false;
							$scope.$apply();
						}

						// Background.getEnvData('/server-status?env=' + self.environments[key].name, function(response) {
						// 	var container = $('#status-' + self.environments[key].name);
						// 	Background.render(config.templates.status, container, {'status': response});
						// });
					});
				});
			});
		}]);

	var Database = chrome.extension.getBackgroundPage().DAxMon.Database;
	var Background = chrome.extension.getBackgroundPage().DAxMon.Background;

	var Popup = {
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

			Background.getEnvironments(function(response) {
				self.environments = response.environments;
				Background.render(config.templates.main, config.containers.main, {'environments': self.environments});

				var envCounter = 0,
					keys = Object.keys(self.environments);

				keys.forEach(function(key) {
					Background.getEnvData('/packages?env=' + self.environments[key].name, function(response) {
						var container = $('#package-' + self.environments[key].name);
						self.environments[key].data = response;
						Background.render(config.templates.packages, container, {'packages': response});

						envCounter++;
						if (envCounter === keys.length) {
							self.enhanceEnvironments(config);
						}

						Background.getEnvData('/server-status?env=' + self.environments[key].name, function(response) {
							var container = $('#status-' + self.environments[key].name);
							Background.render(config.templates.status, container, {'status': response});
						});
					});
				});
			});
		},

		handleDefaultEnv: function() {
			var self = this;

			Database.get(null, function(data) {
				for (var name in self.environments) {
					var radio = $('#default-environment-' + name);

					if (data.defaultEnvironment && data.defaultEnvironment.name === radio.val()) {
						radio.attr('checked', 'checked');
					}
				}


				$('.default-environment-radio').on('change', function() {
					var obj = {
						'defaultEnvironment': {
							'name': $(this).val()
						}
					};
					Database.set(obj);
				});
			});
		},

		enhanceEnvironments: function(config) {
			var self = this;
			var latestRevisionNumbers = { //number, count
					'Server': [0, 0],
					'GUI': [0, 0],
					'Focus': [0, 0],
					'Dashboards': [0, 0]
				};

			function getLatestRevisionNumber(env) {
				for (var i = env.data.length - 1; i >= 0; i--) {
					var revision = parseInt(env.data[i].revision);
					var latest = latestRevisionNumbers[env.data[i].repo];

					if (revision > latest[0]) {
						latestRevisionNumbers[env.data[i].repo] = [revision, 1];
					} else if (revision === latest[0]) {
						latestRevisionNumbers[env.data[i].repo][1]++;
					}
				}
			}

			function checkForLatestAndUniqueRevisions(env) {
				var isPackageModified = false;
				var isEnvModified = false;

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
					Background.render(config.templates.packages, $('#package-' + env.name), {'packages': env.data});
				}
				if (isEnvModified) {
					Background.render(config.templates.main, config.containers.main, {'environments': self.environments});
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
				Background.render(config.templates.main, config.containers.main, {'environments': self.environments});
				renderPackages();
			}

			function renderPackages() {
				for (var key in self.environments) {
					var env = self.environments[key];
					Background.render(config.templates.packages, $('#package-' + env.name), {'packages': env.data});

					self.handleDefaultEnv();
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
		}
	};

	$(document).ready(function() {
		Popup.init();
	});

}(this, this.document, this.jQuery, this.Ashe, this.angular));
