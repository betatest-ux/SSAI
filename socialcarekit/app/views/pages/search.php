<div class="section" data-reveal>
  <div class="container" style="max-width:760px">
    <h1>Search</h1>
    <form action="/search/" method="get" role="search" style="display:flex;gap:.5rem;max-width:520px">
      <label class="visually-hidden" for="search-q">Search the site</label>
      <input type="search" id="search-q" name="q" value="<?= e($q) ?>" placeholder="Search tools, templates, guides, acronyms…">
      <button type="submit" class="btn btn-primary">Search</button>
    </form>

    <?php if ($q !== ''): ?>
      <p class="meta-line" aria-live="polite"><?= count($results) ?> result<?= count($results) === 1 ? '' : 's' ?> for “<?= e($q) ?>”</p>
      <?php if (!$results): ?>
        <p>Nothing matched. Try a shorter word, or browse the <a href="/tools/">tools</a>, <a href="/templates/">templates</a> and <a href="/guides/">guides</a> — and if you expected to find something, <a href="/contact/">tell us</a>: no-result searches literally shape what we build next.</p>
      <?php endif; ?>
      <?php foreach ($results as $r): ?>
      <article class="search-result">
        <span class="search-kind"><?= e($r['kind']) ?></span>
        <h2><a href="<?= e($r['url']) ?>"><?= e($r['title']) ?></a></h2>
        <p><?= e(mb_strimwidth((string) $r['snippet'], 0, 220, '…')) ?></p>
      </article>
      <?php endforeach; ?>
    <?php endif; ?>
  </div>
</div>
