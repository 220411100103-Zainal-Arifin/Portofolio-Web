{{-- Sidebar tab vertikal (bar horizontal di layar sempit) --}}
@php($sections = config('portfolio.sections'))

<nav class="sidebar" aria-label="Navigasi seksi">
  <button type="button" class="brand" data-toggle-background
    aria-label="Ganti latar belakang (tekan B)" title="Ganti latar belakang (B)">Finn — Portfolio</button>

  @foreach ($sections as $section)
    <button type="button"
      @class(['tab-btn', 'active' => $loop->first])
      data-section="{{ $section['key'] }}"
      data-modal-toggle="{{ $section['key'] }}"
      aria-label="{{ $section['aria'] }} (tekan {{ $section['shortcut'] }})">{{ $section['tab'] }}</button>
  @endforeach

  <div class="kbd-hint">
    @foreach ($sections as $section)
      <span class="kbd">{{ $section['shortcut'] }}</span>
    @endforeach
    <span class="kbd">B</span>
  </div>
</nav>
