(function(window, document, $, Ashe, undefined) {
	'use strict';

	var Database = chrome.extension.getBackgroundPage().DAxMon.Database;
	var Background = chrome.extension.getBackgroundPage().DAxMon.Background;

	var Options = {
		init: function() {
			var selectContainer = $('#default-environment');
			var manifest = chrome.runtime.getManifest();

			$('#app-version').text(manifest.version);

			Database.get(null, function(data) {

				Background.render($('#template-envs').html(), selectContainer, data, function() {
					if (data.defaultEnvironment) {
						selectContainer.find('option[value=' + data.defaultEnvironment.name + ']').attr('selected', 'selected');
					}
					selectContainer.on('change', function() {
						var value = $(this).val();

						if (value !== 'none') {
							var obj = {
								'defaultEnvironment': {
									'name': value
								}
							};
							Database.set(obj);
						} else {
							Database.remove('defaultEnvironment');
						}
					});
				});
			});
		}
	};

	$(document).ready(function() {
		Options.init();
	});

}(this, this.document, this.jQuery, this.Ashe));
