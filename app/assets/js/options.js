(function(window, document, $, angular, undefined) {
	'use strict';

	angular
		.module('Options', []);

	var EnvMonitor = angular.module('Options');

	EnvMonitor
		.factory('Database', [function() {
			return chrome.extension.getBackgroundPage().EnvMon.Database;
		}])

		.controller('OptionsCtrl', ['$scope', 'Database', function ($scope, Database) {
			var manifest = chrome.runtime.getManifest();
			$scope.appVersion = manifest.version;
			$scope.environments = {};
			$scope.defaultEnvironment = 'none';

			$scope.updateDefaultEnv = function() {
				if ($scope.defaultEnvironment !== 'none') {
					Database.set({
						'defaultEnvironment': {
							'name': $scope.defaultEnvironment
						}
					});
				} else {
					Database.remove('defaultEnvironment');
				}
			};

			Database.get(null, function(data) {
				$scope.environments = data.environments;
				if (data.defaultEnvironment) {
					$scope.defaultEnvironment = data.defaultEnvironment.name;
				}
				$scope.updateDefaultEnv();
				$scope.$apply();
			});
		}]);

}(this, this.document, this.jQuery, this.angular));
