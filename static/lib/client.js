'use strict';

$(document).ready(function () {
	function bind(widget) {
		const $tabs = widget.find('.deu-tab');
		const $items = widget.find('.deu-item');
		const $filteredEmpty = widget.find('.deu-empty-filtered');

		$tabs.on('click', function () {
			const filter = $(this).attr('data-filter');
			$tabs.removeClass('active');
			$(this).addClass('active');

			let visible = 0;
			$items.each(function () {
				const show = filter === 'all' || $(this).attr('data-faculty') === filter;
				$(this).toggleClass('hidden', !show);
				if (show) { visible += 1; }
			});
			$filteredEmpty.toggleClass('hidden', visible > 0);
		});
	}

	$('.deu-announcements').each(function () {
		bind($(this));
	});
});
