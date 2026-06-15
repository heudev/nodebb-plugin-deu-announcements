<div class="card deu-announcements mb-3" data-deu-default-faculty="{defaultFaculty}">
	<div class="card-header bg-transparent d-flex align-items-center gap-2 py-2">
		<i class="fa-solid fa-bullhorn text-primary"></i>
		<span class="fw-semibold">{title}</span>
		<span class="badge bg-primary rounded-pill ms-auto">{announcements.length}</span>
	</div>

	<div class="deu-tabs px-2 pt-2 border-bottom" role="tablist">
		<button type="button" class="deu-tab active" data-filter="all" role="tab">Tümü</button>
		<!-- BEGIN tabs -->
		<button type="button" class="deu-tab" data-filter="{tabs.id}" role="tab">{tabs.name}</button>
		<!-- END tabs -->
	</div>

	<!-- IF hasAnnouncements -->
	<ul class="list-group list-group-flush deu-list">
		<!-- BEGIN announcements -->
		<li class="list-group-item bg-transparent deu-item" data-faculty="{announcements.faculty}">
			<a class="d-block text-body text-decoration-none fw-medium deu-item-title" href="{announcements.link}" target="_blank" rel="noopener noreferrer">{announcements.title}</a>
			<div class="d-flex align-items-center flex-wrap mt-1 small text-secondary">
				<span class="deu-src">{announcements.sourceName}</span>
				<!-- IF announcements.relativeDate --><span class="deu-date"><i class="fa-regular fa-clock"></i> {announcements.relativeDate}</span><!-- ENDIF announcements.relativeDate -->
			</div>
		</li>
		<!-- END announcements -->
	</ul>
	<div class="deu-empty-filtered text-secondary text-center py-4 d-none">Bu sekmede duyuru yok.</div>
	<!-- ELSE -->
	<div class="text-secondary text-center py-5">
		<i class="fa-solid fa-inbox fa-2x opacity-25"></i>
		<p class="mb-0 mt-2">Şu an gösterilecek duyuru yok.</p>
	</div>
	<!-- ENDIF hasAnnouncements -->

	<a class="card-footer bg-transparent d-flex align-items-center justify-content-between text-decoration-none link-primary fw-medium py-2" href="{moreLink}" target="_blank" rel="noopener noreferrer">
		<span>Tüm Duyurular</span>
		<i class="fa-solid fa-arrow-right"></i>
	</a>
</div>
