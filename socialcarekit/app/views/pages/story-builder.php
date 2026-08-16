<section class="hero">
  <div class="container">
    <h1>Build visual stories that actually get made</h1>
    <p class="lead">A companion app for care teams: choose a story template, swap in the person's name, photos and setting, and print a calm, consistent booklet — in minutes, not evenings.</p>
    <p><a class="btn btn-accent" href="#signup">Join the launch list</a></p>
  </div>
</section>

<div class="section" data-reveal>
  <div class="container">
    <div class="notice" data-reveal="left">
      <p><strong>Independent product.</strong> The Visual Story Builder is not affiliated with, or endorsed by, Carol Gray or Social Stories™. We build generic <em>visual stories</em> — simple, personalised picture-and-text narratives that help people prepare for events and transitions.</p>
    </div>

    <div class="grid grid-3">
      <div class="card">
        <div class="card-icon"><?= view('partials/icon', ['name' => 'book']) ?></div>
        <h2 style="font-size:1.15rem">A real template library</h2>
        <p>Going to the dentist, moving placement, a new key worker, contact day, fire drill — start from a professionally written story instead of a blank page.</p>
      </div>
      <div class="card">
        <div class="card-icon"><?= view('partials/icon', ['name' => 'grid']) ?></div>
        <h2 style="font-size:1.15rem">Variable substitution</h2>
        <p>Type the person's name, pronouns, staff names and place names once — every page updates. Reuse the same story for the next person in seconds.</p>
      </div>
      <div class="card">
        <div class="card-icon"><?= view('partials/icon', ['name' => 'sun']) ?></div>
        <h2 style="font-size:1.15rem">Print-ready</h2>
        <p>Clean A4 and A5 booklet layouts, big readable type, space for photos or symbols — designed for laminating pouches and key-work sessions.</p>
      </div>
    </div>

    <div class="card" style="margin-top:1.5rem;text-align:center;background:var(--c-bg-soft)">
      <p style="margin:2.5rem 0" class="form-hint">[ App screenshots coming here as we approach launch ]</p>
    </div>

    <section id="signup" class="section" style="padding-bottom:0">
      <div style="max-width:560px">
        <h2>Be first to know</h2>
        <?php if ($subscribed): ?>
        <div class="notice notice-success" data-reveal="left"><p><strong>One more step:</strong> we've sent you a confirmation email — click the link inside to join the list (that's the double opt-in that keeps the list spam-free).</p></div>
        <?php else: ?>
        <p>Launch news only — no filler emails. Double opt-in, one-click unsubscribe.</p>
        <form method="post" action="/newsletter/subscribe/">
          <?= App\Core\SpamGuard::fields() ?>
          <input type="hidden" name="list" value="storybuilder">
          <input type="hidden" name="return" value="/story-builder/">
          <div class="form-row">
            <label for="sb-email">Email address</label>
            <input type="email" id="sb-email" name="email" required maxlength="190" autocomplete="email">
          </div>
          <button type="submit" class="btn btn-primary">Join the launch list</button>
        </form>
        <?php endif; ?>
      </div>
    </section>

    <section class="section" style="padding-bottom:0">
      <h2>Frequently asked questions</h2>
      <div class="article-body">
        <h3>What is the Visual Story Builder?</h3>
        <p>A web app for care teams to build personalised visual stories: pick a template, substitute names, photos and settings, and print a ready-to-use booklet.</p>
        <h3>Is this Social Stories™?</h3>
        <p>No. The product is not affiliated with or endorsed by Carol Gray or Social Stories™, whose trademarked approach has its own specific criteria and training. We use the general term "visual stories" throughout.</p>
        <h3>Who is it for?</h3>
        <p>Children's homes, adult services, schools and families — anyone who prepares people for events and transitions with visual structure. Pairs well with our free <a href="/tools/visual-timer/">Visual Timer &amp; Now/Next board</a>.</p>
        <h3>How much will it cost?</h3>
        <p>Pricing isn't announced yet. Launch-list subscribers hear first, and early subscribers won't get a worse deal than anyone else.</p>
      </div>
    </section>
  </div>
</div>
