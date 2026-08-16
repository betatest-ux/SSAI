<div class="section" data-reveal>
  <div class="container" style="max-width:720px">
    <h1>Report an error in a tool</h1>
    <?php if ($sent): ?>
    <div class="notice notice-success" data-reveal="left"><p><strong>Thank you.</strong> Accuracy reports go to the top of our queue — we'll review this against the legislation and correct anything that's wrong, and the page's "last reviewed" date will show when.</p></div>
    <?php else: ?>
    <p>People rely on these tools, so accuracy matters more than pride. If a calculation looks wrong, a regulation is out of date, or a definition is off — tell us, including the numbers or wording if you can.</p>
    <form method="post" action="/report-error/">
      <?= App\Core\SpamGuard::fields() ?>
      <div class="form-row">
        <label for="re-tool">Which tool or page?</label>
        <select id="re-tool" name="tool">
          <option value="">— Choose —</option>
          <?php foreach (App\Controllers\ToolsController::catalogue() as $slug => $t): ?>
          <option value="<?= e($slug) ?>" <?= $tool === $slug ? 'selected' : '' ?>><?= e($t['title']) ?></option>
          <?php endforeach; ?>
          <option value="template" <?= $tool === 'template' ? 'selected' : '' ?>>A template</option>
          <option value="guide">A guide or article</option>
          <option value="other">Something else</option>
        </select>
      </div>
      <div class="form-row">
        <label for="re-message">What's wrong?</label>
        <p class="form-hint">Include the inputs you used and what you expected, or the regulation you think we've misread.</p>
        <textarea id="re-message" name="message" required maxlength="5000"></textarea>
      </div>
      <div class="form-row">
        <label for="re-email">Email (optional — so we can tell you the outcome)</label>
        <input type="email" id="re-email" name="email" maxlength="190">
      </div>
      <button type="submit" class="btn btn-primary">Send report</button>
    </form>
    <?php endif; ?>
  </div>
</div>
