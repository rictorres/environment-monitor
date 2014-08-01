(function(window, document, $, angular, undefined) {
	'use strict';

	angular.module('EnvMonitor', []);

	var EnvMonitor = angular.module('EnvMonitor');

	EnvMonitor
		.factory('Database', [function() {
			return chrome.extension.getBackgroundPage().EnvMon.Database;
		}])

		.factory('Background', [function() {
			return chrome.extension.getBackgroundPage().EnvMon.Background;
		}])

		.controller('PopupCtrl', ['$scope', 'Background', 'Database', function ($scope, Background, Database) {
			$scope.loading = false;
			$scope.selectedEnvId = null;
			$scope.environments = null;

			if (Background.config.server !== '') {
				$scope.loading = true;
			}

			$scope.selectEnv = function(id) {
				$scope.selectedEnvId = id;
				Database.set({
					'defaultEnvironment': {
						'name': id
					}
				});
			};

			Database.get(null, function(data) {
				if (data.defaultEnvironment && data.defaultEnvironment.name) {
					$scope.selectedEnvId = data.defaultEnvironment.name;
					$scope.$apply();
				}
			});

			Database.get('environments', function(envResponse) {
				if (!envResponse.environments) {
					return false;
				}
				$scope.loading = false;
				$scope.environments = envResponse.environments;

				var envLength = Object.keys($scope.environments).length;
				var envPackageCounter = 0;
				var envServiceCounter = 0;
				var getEnvDetails = function getEnvDetails(env) {
					Background.getData('/server-status?env=' + env.id, function(serviceResponse) {
						env.services = serviceResponse;

						envServiceCounter++;
						if (envServiceCounter === envLength) {
							$scope.$apply();
						}
					});

					Background.getData('/packages?env=' + env.id, function(packageResponse) {
						env.packages = packageResponse;

						envPackageCounter++;
						if (envPackageCounter === 0) {
							for (var i = env.packages.length - 1; i >= 0; i--) {
								$scope.latestRevisionNumbers[env.packages[i].repo] = env.packages[i].revision;
							}
						}
						if (envPackageCounter === envLength) {
							$scope.enhanceEnvironments();
							$scope.$apply();
						}
					});
				};

				if (envLength > 0) {
					for (var key in $scope.environments) {
						getEnvDetails($scope.environments[key]);
					}
				}
			});

			$scope.latestRevisionNumbers = {};
			$scope.enhanceEnvironments = function() {
				function getLatestRevisionNumber(env) {
					for (var i = env.packages.length - 1; i >= 0; i--) {
						var revision = parseInt(env.packages[i].revision);
						var latest = $scope.latestRevisionNumbers[env.packages[i].repo] || [0,0];

						if (revision > latest[0]) {
							$scope.latestRevisionNumbers[env.packages[i].repo] = [revision, 1];
						} else if (revision === latest[0]) {
							$scope.latestRevisionNumbers[env.packages[i].repo][1]++;
						}
					}
				}

				function checkForLatestAndUniqueRevisions(env) {
					for (var i = env.packages.length - 1; i >= 0; i--) {
						var latest = $scope.latestRevisionNumbers[env.packages[i].repo] || [0,0];

						if (parseInt(env.packages[i].revision) === latest[0]) {
							env.packages[i].latest = true;

							if (latest[1] === 1) {
								env.packages[i].unique = true;
								env.hasUnique = true;
							}
						}
					}
				}

				function checkForPerfectEnvironments(env) {
					for (var i = env.packages.length - 1; i >= 0; i--) {
						if (!env.packages[i].latest) {
							return;
						}
					}
					env.onFire = true;
				}

				for (var i = $scope.environments.length - 1; i >= 0; i--) {
					getLatestRevisionNumber($scope.environments[i]);
				}
				for (var k = $scope.environments.length - 1; k >= 0; k--) {
					checkForLatestAndUniqueRevisions($scope.environments[k]);
				}
				for (var l = $scope.environments.length - 1; l >= 0; l--) {
					checkForPerfectEnvironments($scope.environments[l]);
				}
			};
		}]);

}(this, this.document, this.jQuery, this.angular));
