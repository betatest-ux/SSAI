<div class="section">
  <div class="container" style="max-width:720px">
    <h1>Contact &amp; feedback</h1>
    <?php if ($sent): ?>
    <div class="notice notice-success" data-reveal="left"><p><strong>Thank you — your message has been received.</strong> If you left an email address and your message needs a reply, we'll be in touch.</p></div>
    <?php else: ?>
    <p>Questions, feedback, a template you wish existed, an acronym we're missing — we read everything. To report a mistake in a tool, use the dedicated <a href="/report-error/">report an error</a> form.</p>
    <form method="post" action="/contact/" data-reveal>
      <?= App\Core\SpamGuard::fields() ?>
      <div class="form-row">
        <label for="ct-name">Your name (optional)</label>
        <input type="text" id="ct-name" name="name" maxlength="120" autocomplete="name">
      </div>
      <div class="form-row">
        <label for="ct-email">Email (optional — only if you'd like a reply)</label>
        <input type="email" id="ct-email" name="email" maxlength="190" autocomplete="email">
      </div>
      <div class="form-row">
        <label for="ct-subject">Subject</label>
        <input type="text" id="ct-subject" name="subject" maxlength="255">
      </div>
      <div class="form-row">
        <label for="ct-message">Message</label>
        <textarea id="ct-message" name="message" required maxlength="5000"></textarea>
      </div>
      <button type="submit" class="btn btn-primary">Send message</button>
    </form>
    <h2 data-reveal>Newsletter</h2>
    <?php if (isset($_GET['subscribed'])): ?>
    <div class="notice notice-success" data-reveal="left"><p><strong>Nearly there:</strong> we've emailed you a confirmation link — click it to finish subscribing.</p></div>
    <?php endif; ?>
    <p data-reveal>Occasional email when we add tools, templates or important legal updates (like new NMW rates). Double opt-in, unsubscribe any time, no tracking.</p>
    <form method="post" action="/newsletter/subscribe/" data-reveal>
      <?= App\Core\SpamGuard::fields() ?>
      <input type="hidden" name="list" value="general">
      <div class="form-row">
        <label for="nl-email">Email address</label>
        <input type="email" id="nl-email" name="email" required maxlength="190" autocomplete="email">
      </div>
      <button type="submit" class="btn btn-outline">Subscribe</button>
    </form>
    <?php endif; ?>
  </div>
</div>
