'use strict';

$(document).ready(function () {
	function bind(widget) {
		const $tabs = widget.find('.deu-tab');
		const $items = widget.find('.deu-item');
		const $filteredEmpty = widget.find('.deu-empty-filtered');
		const defaultFaculty = widget.attr('data-deu-default-faculty');

		$tabs.on('click', function () {
			const filter = $(this).attr('data-filter');
			$tabs.removeClass('active');
			$(this).addClass('active');

			let visible = 0;
			$items.each(function () {
				const f = $(this).attr('data-faculty');
				const show = filter === 'all'
					|| (filter === 'main' && f === 'main')
					|| (filter === 'faculty' && f === defaultFaculty);
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
