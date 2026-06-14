'use strict';

define('admin/plugins/deu-announcements', ['settings', 'alerts'], function (Settings, alerts) {
	const ACP = {};

	ACP.init = function () {
		Settings.load('deu-announcements', $('.deu-settings'));

		$('#save').on('click', function () {
			Settings.save('deu-announcements', $('.deu-settings'), function () {
				alerts.alert({
					type: 'success',
					alert_id: 'deu-saved',
					timeout: 2500,
					title: 'Kaydedildi',
					message: 'Ayarlar kaydedildi. Değişikliklerin geçerli olması için NodeBB\'yi yeniden başlatın.',
				});
			});
		});
	};

	return ACP;
});
