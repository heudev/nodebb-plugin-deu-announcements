<div class="acp-page-container">
	<div class="row">
		<div class="col-12 col-md-8">
			<div class="card">
				<div class="card-header">DEÜ Duyuruları Ayarları</div>
				<div class="card-body">
					<form role="form" class="deu-settings">
						<div class="mb-3">
							<label class="form-label" for="intervalMinutes">Yenileme aralığı (dakika)</label>
							<input type="number" min="5" id="intervalMinutes" name="intervalMinutes" class="form-control" placeholder="30">
							<p class="form-text">Duyuruların kaynaklardan kaç dakikada bir çekileceği (en az 5).</p>
						</div>
						<div class="mb-3">
							<label class="form-label" for="limit">Gösterilecek duyuru sayısı</label>
							<input type="number" min="1" id="limit" name="limit" class="form-control" placeholder="60">
						</div>
						<div class="mb-3">
							<label class="form-label" for="defaultFaculty">Varsayılan "Fakültem"</label>
							<select id="defaultFaculty" name="defaultFaculty" class="form-select">
								<option value="">— Seçiniz —</option>
								<!-- BEGIN sources -->
								<option value="{sources.id}">{sources.name}</option>
								<!-- END sources -->
							</select>
							<p class="form-text">Widget'taki "Fakültem" sekmesinin varsayılan fakültesi. Widget ayarından üzerine yazılabilir.</p>
						</div>

						<label class="form-label">Kaynaklar</label>
						<div class="deu-sources-grid">
							<!-- BEGIN sources -->
							<div class="form-check">
								<input type="checkbox" class="form-check-input" id="disabled_{sources.id}" name="disabled_{sources.id}">
								<label class="form-check-label" for="disabled_{sources.id}">{sources.name} <span class="text-muted">— kaynağı kapat</span></label>
							</div>
							<!-- END sources -->
						</div>
						<p class="form-text">İşaretlenen kaynaklar duyuru çekiminden çıkarılır.</p>
					</form>
				</div>
			</div>
		</div>

		<div class="col-12 col-md-4">
			<div class="card">
				<div class="card-header">Bilgi</div>
				<div class="card-body">
					<p>Ayarları kaydettikten sonra değişikliklerin geçerli olması için NodeBB'yi yeniden başlatın.</p>
					<p class="mb-0">Widget'ı eklemek için: <strong>ACP → Genişletme → Widget'lar</strong> ekranından "DEÜ Duyuruları" widget'ını bir alana sürükleyin.</p>
				</div>
			</div>
		</div>
	</div>

	<button id="save" class="floating-button mdl-button mdl-js-button mdl-button--fab mdl-js-ripple-effect mdl-button--colored">
		<i class="material-icons">save</i>
	</button>
</div>
