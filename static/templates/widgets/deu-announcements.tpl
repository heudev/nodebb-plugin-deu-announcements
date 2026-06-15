<div class="deu-announcements" data-deu-default-faculty="{defaultFaculty}">
	<div class="deu-header">
		<span class="deu-icon"><i class="fa fa-bullhorn"></i></span>
		<span class="deu-head-text">
			<span class="deu-title">{title}</span>
			<span class="deu-subtitle">Dokuz Eylül Üniversitesi</span>
		</span>
		<span class="deu-head-count">{announcements.length}</span>
	</div>

	<div class="deu-tabs" role="tablist">
		<button type="button" class="deu-tab active" data-filter="all" role="tab">Tümü</button>
		<!-- BEGIN tabs -->
		<button type="button" class="deu-tab" data-filter="{tabs.id}" role="tab">{tabs.name}</button>
		<!-- END tabs -->
	</div>

	<div class="deu-subtabs hidden">
		<!-- BEGIN tabs -->
		<div class="deu-subgroup hidden" data-category="{tabs.id}">
			<button type="button" class="deu-subtab active" data-sub="all">Tümü</button>
			<!-- BEGIN tabs.sources -->
			<button type="button" class="deu-subtab" data-sub="{tabs.sources.id}">{tabs.sources.name}</button>
			<!-- END tabs.sources -->
		</div>
		<!-- END tabs -->
	</div>

	<!-- IF hasAnnouncements -->
	<ul class="deu-list">
		<!-- BEGIN announcements -->
		<li class="deu-item deu-c-{announcements.category}" data-category="{announcements.category}" data-faculty="{announcements.faculty}">
			<a class="deu-item-title" href="{announcements.link}" target="_blank" rel="noopener noreferrer">{announcements.title}</a>
			<span class="deu-meta">
				<span class="deu-dot"></span>
				<span class="deu-src">{announcements.sourceName}</span>
				<!-- IF announcements.relativeDate --><span class="deu-date"><i class="fa fa-calendar-o"></i> {announcements.relativeDate}</span><!-- ENDIF announcements.relativeDate -->
			</span>
		</li>
		<!-- END announcements -->
	</ul>
	<div class="deu-empty deu-empty-filtered hidden">
		<i class="fa fa-filter"></i>
		<p>Bu seçimde duyuru yok.</p>
	</div>
	<!-- ELSE -->
	<div class="deu-empty">
		<i class="fa fa-inbox"></i>
		<p>Şu an gösterilecek duyuru yok.</p>
		<small>Duyurular kısa süre içinde yüklenecek.</small>
	</div>
	<!-- ENDIF hasAnnouncements -->

	<a class="deu-cta" href="{moreLink}" target="_blank" rel="noopener noreferrer">
		<span class="deu-cta-icon"><i class="fa fa-list-ul"></i></span>
		<span class="deu-cta-text">
			<strong>Tüm Duyurular</strong>
			<span>deu.edu.tr</span>
		</span>
		<span class="deu-cta-arrow"><i class="fa fa-arrow-right"></i></span>
	</a>
</div>
