@extends('layouts.portfolio')

@section('content')

  <!-- Background -->
  <div class="bg-scene" id="bg-scene">
    <div class="bg-layer3"></div>
  </div>

  <!-- Layout -->
  <div class="main-layout">

    @include('portfolio.partials.sidebar')

    <!-- Konten utama -->
    <main class="content-area">
      @include('portfolio.partials.hero')
      @include('portfolio.partials.strip-cards')
      @include('portfolio.partials.widget')
    </main>
  </div>

  @include('portfolio.partials.modal')

@endsection
