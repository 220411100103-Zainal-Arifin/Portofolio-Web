@extends('layouts.portfolio')
@section('content')
  <div class="bg-scene" id="bg-scene">
    <div class="bg-layer3"></div>
  </div>
  <div class="main-layout">
    @include('portfolio.partials.sidebar')
    <main class="content-area">
      @include('portfolio.partials.hero')
      @include('portfolio.partials.strip-cards')
      @include('portfolio.partials.widget')
    </main>
  </div>
  @include('portfolio.partials.modal')
@endsection
