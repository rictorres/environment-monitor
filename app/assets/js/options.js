(function(window, document, $, angular, undefined) {
	'use strict';

	angular
		.module('Options', []);

	var EnvMonitor = angular.module('Options');

	EnvMonitor
		.factory('Database', [function() {
			return chrome.extension.getBackgroundPage().EnvMon.Database;
		}])

		.factory('Background', [function() {
			return chrome.extension.getBackgroundPage().EnvMon.Background;
		}])

		.filter('url', [function() {
			return function(input) {
				return (input.substr(-1) === '/') ? input.substr(0, input.length - 1) : input;
			};
		}])

		.controller('OptionsCtrl', ['$scope', '$timeout', '$filter', 'Database', 'Background', function ($scope, $timeout, $filter, Database, Background) {
			var manifest = chrome.runtime.getManifest();
			$scope.appVersion = manifest.version;
			$scope.environments = null;
			$scope.defaults = {
				server: null,
				environment: 'none',
				notifications: true
			};

			$scope.updateOptions = function() {
				$scope.updateDefaultServer();
				$scope.updateDefaultEnv();
				$scope.updateNotifications();
			};

			$scope.updateDefaultServer = function() {
				if ($scope.defaults.server !== '') {
					Database.set({
						'defaultServer': {
							'addr': $filter('url')($scope.defaults.server)
						}
					}, function() {
						Background.setup();

						$timeout($scope.getData, 2000);
					});
				}
			};

			$scope.updateDefaultEnv = function() {
				if ($scope.defaults.environment !== 'none') {
					Database.set({
						'defaultEnvironment': {
							'name': $scope.defaults.environment
						}
					});
				}
			};

			$scope.updateNotifications = function() {
				Database.set({
					'displayNotifications': $scope.defaults.notifications
				});
			};

			$scope.getData = function() {
				Database.get(null, function(data) {
					console.log(data);
					$scope.environments = data.environments;

					if (data.defaultEnvironment && data.defaultEnvironment.name !== '') {
						$scope.defaults.environment = data.defaultEnvironment.name;
					}

					if (data.defaultServer && data.defaultServer.addr !== '') {
						$scope.defaults.server = data.defaultServer.addr;
					}

					if (data.displayNotifications !== undefined) {
						$scope.defaults.notifications = data.displayNotifications;
					}

					$scope.$apply();
				});
			};

			$scope.getData();
		}]);

}(this, this.document, this.jQuery, this.angular));
