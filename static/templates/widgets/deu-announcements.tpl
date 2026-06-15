<div class="deu-announcements" data-deu-default-faculty="{defaultFaculty}">
	<style scoped>
	.deu-announcements{
		--deu-navy:#00457c; --deu-navy-d:#003257; --deu-burgundy:#8c1d40; --deu-accent:#0a5fa3;
		--deu-surface:var(--bs-body-bg,#fff);
		--deu-text:var(--bs-body-color,#1f2937);
		--deu-muted:var(--bs-secondary-color,#6b7280);
		--deu-line:var(--bs-border-color,rgba(17,24,39,.08));
		--deu-hover:rgba(10,95,163,.06);
		position:relative; border:1px solid var(--deu-line); border-radius:16px; overflow:hidden;
		background:var(--deu-surface);
		box-shadow:0 1px 2px rgba(17,24,39,.04),0 8px 24px -12px rgba(17,24,39,.12);
		font-size:.9rem; line-height:1.4;
	}
	.deu-announcements *{box-sizing:border-box;}

	/* Header */
	.deu-header{position:relative; display:flex; align-items:center; gap:.75rem; padding:1rem 1.1rem;
		background:linear-gradient(135deg,var(--deu-navy-d) 0%,var(--deu-navy) 48%,var(--deu-burgundy) 100%);
		color:#fff; overflow:hidden;}
	.deu-header::after{content:""; position:absolute; top:-40%; right:-8%; width:190px; height:190px;
		background:radial-gradient(circle,rgba(255,255,255,.16),transparent 70%); pointer-events:none;}
	.deu-icon{flex:0 0 auto; width:42px; height:42px; border-radius:12px;
		background:rgba(255,255,255,.16); backdrop-filter:blur(4px);
		display:flex; align-items:center; justify-content:center; font-size:1.15rem; color:#fff;
		box-shadow:inset 0 0 0 1px rgba(255,255,255,.18);}
	.deu-head-text{display:flex; flex-direction:column; min-width:0; z-index:1;}
	.deu-title{font-weight:700; font-size:1.02rem; letter-spacing:.2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;}
	.deu-subtitle{font-size:.74rem; opacity:.82; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;}
	.deu-head-count{margin-left:auto; z-index:1; flex:0 0 auto; font-size:.72rem; font-weight:700;
		padding:.18rem .55rem; border-radius:999px; background:rgba(255,255,255,.2);}

	/* Tabs */
	.deu-tabs{display:flex; gap:.1rem; padding:.4rem .5rem 0; overflow-x:auto; scrollbar-width:none;
		background:var(--bs-tertiary-bg,rgba(17,24,39,.025)); border-bottom:1px solid var(--deu-line);}
	.deu-tabs::-webkit-scrollbar{display:none;}
	.deu-tab{flex:0 0 auto; cursor:pointer; padding:.5rem .8rem; font-size:.82rem; font-weight:600;
		color:var(--deu-muted); border:0; background:none; white-space:nowrap; position:relative;
		border-radius:8px 8px 0 0; transition:color .15s ease,background .15s ease;}
	.deu-tab:hover{color:var(--deu-text); background:var(--deu-hover);}
	.deu-tab.active{color:var(--deu-accent);}
	.deu-tab.active::after{content:""; position:absolute; left:.55rem; right:.55rem; bottom:-1px; height:2.5px;
		border-radius:3px; background:var(--deu-accent);}

	/* List */
	.deu-list{list-style:none; margin:0; padding:.25rem 0; max-height:460px; overflow-y:auto; scrollbar-width:thin;}
	.deu-item{position:relative; display:block; padding:.7rem 1.05rem .7rem 1.15rem;
		border-bottom:1px solid var(--deu-line); transition:background .12s ease;
		animation:deu-in .4s ease both;}
	.deu-item:last-child{border-bottom:0;}
	.deu-item::before{content:""; position:absolute; left:0; top:.55rem; bottom:.55rem; width:3px; border-radius:0 3px 3px 0;
		background:var(--deu-dot,var(--deu-accent)); opacity:0; transition:opacity .15s ease;}
	.deu-item:hover{background:var(--deu-hover);}
	.deu-item:hover::before{opacity:1;}
	.deu-item.hidden{display:none;}
	.deu-item-title{display:block; color:var(--deu-text); font-weight:500; font-size:.9rem; line-height:1.35;
		text-decoration:none; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;}
	.deu-item:hover .deu-item-title{color:var(--deu-accent);}
	.deu-meta{display:flex; align-items:center; gap:.4rem; margin-top:.3rem; font-size:.74rem; color:var(--deu-muted);}
	.deu-dot{flex:0 0 auto; width:7px; height:7px; border-radius:50%; background:var(--deu-dot,var(--deu-accent));}
	.deu-src{font-weight:600;}
	.deu-date{display:inline-flex; align-items:center; gap:.25rem;}
	.deu-date::before{content:"·"; margin-right:.1rem; opacity:.6;}

	/* faculty colors */
	.deu-f-main{--deu-dot:#8c1d40;} .deu-f-iibf{--deu-dot:#1d6f42;} .deu-f-hukuk{--deu-dot:#6f42c1;}
	.deu-f-muhendislik{--deu-dot:#b35900;} .deu-f-tip{--deu-dot:#c0392b;} .deu-f-edebiyat{--deu-dot:#117a8b;}
	.deu-f-fen{--deu-dot:#2a6fb0;} .deu-f-isletme{--deu-dot:#5a6268;} .deu-f-ogrenci{--deu-dot:#0b7285;}
	.deu-f-sks{--deu-dot:#ad6800;}

	/* Empty */
	.deu-empty{padding:2.2rem 1rem; text-align:center; color:var(--deu-muted);}
	.deu-empty i{font-size:1.7rem; opacity:.35;}
	.deu-empty p{margin:.6rem 0 .15rem; font-weight:600; color:var(--deu-text);}
	.deu-empty small{opacity:.8;}

	/* Footer CTA */
	.deu-cta{display:flex; align-items:center; gap:.7rem; padding:.85rem 1.05rem; text-decoration:none; color:#fff;
		background:linear-gradient(135deg,var(--deu-navy) 0%,var(--deu-burgundy) 115%);}
	.deu-cta:hover{color:#fff;}
	.deu-cta-icon{flex:0 0 auto; width:34px; height:34px; border-radius:9px; background:rgba(255,255,255,.18);
		display:flex; align-items:center; justify-content:center; font-size:.95rem;}
	.deu-cta-text{display:flex; flex-direction:column; min-width:0;}
	.deu-cta-text strong{font-size:.86rem; font-weight:700;}
	.deu-cta-text span{font-size:.72rem; opacity:.8;}
	.deu-cta-arrow{margin-left:auto; flex:0 0 auto; width:30px; height:30px; border-radius:50%;
		background:rgba(255,255,255,.2); display:flex; align-items:center; justify-content:center;
		transition:transform .18s ease, background .18s ease;}
	.deu-cta:hover .deu-cta-arrow{transform:translateX(3px); background:rgba(255,255,255,.32);}

	@keyframes deu-in{from{opacity:0; transform:translateY(5px);} to{opacity:1; transform:none;}}
	.deu-item:nth-child(1){animation-delay:.02s} .deu-item:nth-child(2){animation-delay:.05s}
	.deu-item:nth-child(3){animation-delay:.08s} .deu-item:nth-child(4){animation-delay:.11s}
	.deu-item:nth-child(5){animation-delay:.14s} .deu-item:nth-child(6){animation-delay:.17s}
	.deu-item:nth-child(7){animation-delay:.2s}  .deu-item:nth-child(8){animation-delay:.23s}

	/* Dark mode */
	html[data-bs-theme="dark"] .deu-announcements{
		--deu-accent:#4f9fe0; --deu-hover:rgba(79,159,224,.1);
		box-shadow:0 1px 2px rgba(0,0,0,.3),0 10px 28px -14px rgba(0,0,0,.5);
	}
	</style>

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

	<!-- IF hasAnnouncements -->
	<ul class="deu-list">
		<!-- BEGIN announcements -->
		<li class="deu-item deu-f-{announcements.faculty}" data-faculty="{announcements.faculty}">
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
		<p>Bu sekmede duyuru yok.</p>
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
