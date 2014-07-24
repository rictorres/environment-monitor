(function(window, document, $, angular, undefined) {
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

		.controller('PopupCtrl', ['$scope', 'Background', 'Database', function ($scope, Background, Database) {
			$scope.loading = true;
			$scope.selectedEnvId = null;
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

			Background.getEnvironments(function(response) {
				response = {
					'environments': [
						{
							'id': 'dax-dev01',
							'title': 'DEV01',
							'addr': '10.11.57.42'
						},
						{
							'id': 'dax-dev05',
							'title': 'DEV03',
							'addr': '10.11.57.82'
						},
						{
							'id': 'qa01',
							'title': 'QA01',
							'addr': '10.11.11.185'
						},
						{
							'id': 'qa03',
							'title': 'QA03',
							'addr': '10.11.21.185'
						},
					]
				};
				$scope.environments = response.environments;

				var getDetailsOfEnv = function(env) {

					Background.getEnvData('/server-status?env=' + env.id, function(serviceResponse) {
						serviceResponse = {
							'services': [
								{
									'id': 'apache',
									'title': 'Apache',
									'online': true
								},
								{
									'id': 'tomcat',
									'title': 'Tomcat',
									'online': false
								}
							]
						};
						env.services = serviceResponse.services;

						envServiceCounter++;
						if (envServiceCounter === $scope.environments.length) {
							$scope.$apply();
						}
					});

					Background.getEnvData('/packages?env=' + env.id, function(packageResponse) {
						packageResponse = {
							'packages': [
								{
									'repo': 'GUI',
									'branch': 'trunk',
									'revision': Math.floor((Math.random() * 10) + 1)
								},
								{
									'repo': 'Server',
									'branch': 'trunk',
									'revision': Math.floor((Math.random() * 10) + 1)
								}
							]
						};
						env.packages = packageResponse.packages;

						envPackageCounter++;
						if (envPackageCounter === 0) {
							for (var i = env.packages.length - 1; i >= 0; i--) {
								$scope.latestRevisionNumbers[env.packages[i].repo] = env.packages[i].revision;
							}
						}
						if (envPackageCounter === $scope.environments.length) {
							$scope.loading = false;
							$scope.enhanceEnvironments();
							$scope.$apply();
						}
					});
				};

				var envPackageCounter = 0,
					envServiceCounter = 0;

				for (var i = 0; i < response.environments.length; i++) {
					getDetailsOfEnv($scope.environments[i]);
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
