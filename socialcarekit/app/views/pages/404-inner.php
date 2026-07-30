<div class="section">
  <div class="container" style="max-width:640px">
    <h1>Page not found</h1>
    <p>That page doesn't exist (or has moved — old links get redirected, so this one is genuinely gone).</p>
    <form action="/search/" method="get" role="search" style="display:flex;gap:.5rem;max-width:460px">
      <label class="visually-hidden" for="nf-q">Search the site</label>
      <input type="search" id="nf-q" name="q" placeholder="Search for what you were after…">
      <button type="submit" class="btn btn-primary">Search</button>
    </form>
    <h2>Popular tools</h2>
    <ul>
      <?php
      $catalogue = App\Controllers\ToolsController::catalogue();
      $shown = 0;
      foreach ($popular as $p) {
          $slug = trim(str_replace('/tools/', '', $p['path']), '/');
          if (isset($catalogue[$slug]) && $shown < 5) {
              $shown++;
              echo '<li><a href="/tools/' . e($slug) . '/">' . e($catalogue[$slug]['title']) . '</a></li>';
          }
      }
      if (!$shown) {
          foreach (array_slice($catalogue, 0, 5, true) as $slug => $t) {
              echo '<li><a href="/tools/' . e($slug) . '/">' . e($t['title']) . '</a></li>';
          }
      }
      ?>
    </ul>
    <p><a href="/">Back to the homepage →</a></p>
  </div>
</div>
