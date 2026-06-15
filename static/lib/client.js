'use strict';

// Stiller static/style.scss içinde, tema CSS bundle'ına derlenir.
// Burada iki seviyeli filtreleme: kategori (üst sekme) + kaynak (alt pill).
$(document).ready(function () {
	function bind(widget) {
		const $tabs = widget.find('.deu-tab');
		const $subWrap = widget.find('.deu-subtabs');
		const $subgroups = widget.find('.deu-subgroup');
		const $items = widget.find('.deu-item');
		const $filteredEmpty = widget.find('.deu-empty-filtered');

		let cat = 'all';
		let sub = 'all';

		function apply() {
			let visible = 0;
			$items.each(function () {
				const c = this.getAttribute('data-category');
				const f = this.getAttribute('data-faculty');
				const show = (cat === 'all' || c === cat) && (sub === 'all' || f === sub);
				this.classList.toggle('hidden', !show);
				if (show) { visible += 1; }
			});
			$filteredEmpty.toggleClass('hidden', visible > 0);
		}

		$tabs.on('click', function () {
			cat = this.getAttribute('data-filter');
			sub = 'all';
			$tabs.removeClass('active');
			this.classList.add('active');

			// alt-filtre satırını göster/gizle ve doğru grubu seç
			$subgroups.addClass('hidden');
			if (cat === 'all') {
				$subWrap.addClass('hidden');
			} else {
				$subWrap.removeClass('hidden');
				const $g = $subgroups.filter('[data-category="' + cat + '"]');
				$g.removeClass('hidden');
				$g.find('.deu-subtab').removeClass('active');
				$g.find('.deu-subtab[data-sub="all"]').addClass('active');
			}
			apply();
		});

		widget.find('.deu-subtab').on('click', function () {
			sub = this.getAttribute('data-sub');
			$(this).closest('.deu-subgroup').find('.deu-subtab').removeClass('active');
			this.classList.add('active');
			apply();
		});
	}

	$('.deu-announcements').each(function () {
		bind($(this));
	});
});
