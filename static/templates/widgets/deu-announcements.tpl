<div class="deu-announcements" data-deu-default-faculty="{defaultFaculty}">
	<div class="deu-header">
		<span class="deu-header-left">
			<i class="fa fa-bullhorn"></i>
			<span class="deu-title">{title}</span>
		</span>
		<span class="deu-count">{announcements.length}</span>
	</div>

	<ul class="deu-tabs" role="tablist">
		<li class="deu-tab active" data-filter="all" role="tab">Tümü</li>
		<!-- IF hasFaculty -->
		<li class="deu-tab" data-filter="faculty" role="tab">Fakültem</li>
		<!-- ENDIF hasFaculty -->
		<li class="deu-tab" data-filter="main" role="tab">Ana</li>
	</ul>

	<!-- IF hasAnnouncements -->
	<ul class="deu-list">
		<!-- BEGIN announcements -->
		<li class="deu-item" data-faculty="{announcements.faculty}">
			<span class="deu-badge deu-badge-{announcements.faculty}">{announcements.sourceName}</span>
			<a class="deu-item-title" href="{announcements.link}" target="_blank" rel="noopener noreferrer">{announcements.title}</a>
			<!-- IF announcements.relativeDate -->
			<span class="deu-date"><i class="fa fa-clock-o"></i> {announcements.relativeDate}</span>
			<!-- ENDIF announcements.relativeDate -->
		</li>
		<!-- END announcements -->
	</ul>
	<div class="deu-empty deu-empty-filtered hidden">Bu sekmede gösterilecek duyuru yok.</div>
	<!-- ELSE -->
	<div class="deu-empty">
		<i class="fa fa-inbox"></i>
		<p>Şu an gösterilecek duyuru yok.</p>
		<small>Duyurular kısa süre içinde yüklenecek.</small>
	</div>
	<!-- ENDIF hasAnnouncements -->

	<a class="deu-more" href="{moreLink}" target="_blank" rel="noopener noreferrer">Tüm duyurular <i class="fa fa-arrow-right"></i></a>
</div>
