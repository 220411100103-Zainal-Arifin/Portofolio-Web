{{-- Kotak besar yang "pecah" jadi 4 keping. Posisi tiap kartu diatur lewat 'slot' di config/portfolio.php --}}
<div class="strip-cards" role="list">
  @foreach (config('portfolio.sections') as $section)
    <button type="button"
      class="strip-card theme-{{ $section['key'] }} slot-{{ $section['slot'] }}"
      role="listitem"
      data-modal-toggle="{{ $section['key'] }}"
      aria-label="Buka {{ $section['aria'] }} (tekan {{ $section['shortcut'] }})">
      <div class="strip-card-content">
        <div class="strip-card-top">
          <span class="strip-card-num">{{ sprintf('%02d', $loop->iteration) }}</span>
          <span class="strip-card-corner">
            <span class="kbd-badge">{{ $section['shortcut'] }}</span>
            <span class="strip-card-arrow">↗</span>
          </span>
        </div>
        <div class="strip-card-body">
          <div class="strip-card-title">{{ $section['title'] }}</div>
          <div class="strip-card-desc">{{ $section['desc'] }}</div>
        </div>
      </div>
    </button>
  @endforeach

  {{-- Garis pemisah antar keping (koordinat sama dengan clip-path di strip-cards.css) --}}
  <svg class="strip-cards-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
    <line x1="38" y1="0"     x2="47.5" y2="41.66" />
    <line x1="0"  y1="63.7"  x2="100"  y2="17.3" />
    <line x1="38" y1="46.07" x2="100"  y2="100" />
  </svg>
</div>
