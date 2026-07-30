<div class="section">
  <div class="container">
    <h1>Visual Timer &amp; Now/Next Board</h1>
    <?= view('partials/tool-privacy') ?>
    <p style="max-width:680px">A calm, tablet-friendly now-and-next board with a visual countdown. Choose picture cards, set a time, and press <strong>Full screen</strong>. Once the page has loaded it works offline — add it to your tablet's home screen.</p>

    <div class="tool-panel" id="vt-setup">
      <div class="grid grid-2">
        <fieldset>
          <legend>NOW</legend>
          <div class="form-row">
            <label for="vt-now-label">Label</label>
            <input type="text" id="vt-now-label" value="Play time" autocomplete="off">
          </div>
          <div class="field-label">Picture</div>
          <div class="vt-icon-grid" id="vt-now-icons" role="listbox" aria-label="Choose a picture for Now"></div>
        </fieldset>
        <fieldset>
          <legend>NEXT</legend>
          <div class="form-row">
            <label for="vt-next-label">Label</label>
            <input type="text" id="vt-next-label" value="Tidy up" autocomplete="off">
          </div>
          <div class="field-label">Picture</div>
          <div class="vt-icon-grid" id="vt-next-icons" role="listbox" aria-label="Choose a picture for Next"></div>
        </fieldset>
      </div>
      <div class="grid grid-3">
        <div class="form-row">
          <label for="vt-minutes">Timer length</label>
          <select id="vt-minutes">
            <option value="1">1 minute</option>
            <option value="2">2 minutes</option>
            <option value="5" selected>5 minutes</option>
            <option value="10">10 minutes</option>
            <option value="15">15 minutes</option>
            <option value="20">20 minutes</option>
            <option value="30">30 minutes</option>
          </select>
        </div>
        <div class="form-row">
          <label for="vt-style">Countdown style</label>
          <select id="vt-style">
            <option value="circle" selected>Shrinking circle</option>
            <option value="bar">Shrinking bar</option>
          </select>
        </div>
        <div class="form-row">
          <label class="check-row" style="margin-top:1.9rem"><input type="checkbox" id="vt-chime" checked> Soft chime at the end</label>
        </div>
      </div>
      <div class="tool-actions">
        <button type="button" class="btn btn-primary" id="vt-start">Start board</button>
        <button type="button" class="btn btn-outline" id="vt-fullscreen">Start in full screen</button>
      </div>
    </div>

    <div id="vt-board" class="vt-board" hidden>
      <div class="vt-panes">
        <section class="vt-pane vt-pane-now" aria-label="Now">
          <h2>NOW</h2>
          <div class="vt-card" id="vt-card-now"></div>
        </section>
        <section class="vt-pane vt-pane-next" aria-label="Next">
          <h2>NEXT</h2>
          <div class="vt-card" id="vt-card-next"></div>
        </section>
      </div>
      <div class="vt-timer-zone">
        <div id="vt-countdown" role="timer" aria-live="off"></div>
        <div class="vt-controls">
          <button type="button" class="btn btn-accent" id="vt-swap">✓ Done — swap Next into Now</button>
          <button type="button" class="btn btn-outline" id="vt-pause">Pause</button>
          <button type="button" class="btn btn-ghost" id="vt-exit">Exit board</button>
        </div>
      </div>
    </div>

    <section class="how-it-works">
      <h2>Why now-and-next boards help</h2>
      <p>Visual structure reduces anxiety for many autistic children and adults, people with learning disabilities, and anyone who finds transitions hard. Seeing what is happening <em>now</em> and what comes <em>next</em> — with a predictable, non-startling countdown — makes transitions feel safe rather than sudden.</p>
      <ul>
        <li>The countdown shrinks gently and shifts colour gradually — <strong>no flashing</strong> (photosensitivity-safe), and the optional chime is soft.</li>
        <li>Keep language on the cards short and concrete ("Snack", "Bus", "Quiet time").</li>
        <li>Swap the NEXT card in as soon as the activity changes, and involve the person in choosing cards where possible.</li>
      </ul>
    </section>

    <?= view('partials/tool-footer', [
        'toolSlug' => 'visual-timer',
        'lastReviewed' => '2026-07-01',
        'related' => [
            ['title' => 'De-escalation and low-arousal approaches', 'url' => '/guides/de-escalation-low-arousal/', 'kind' => 'Guide'],
            ['title' => 'Visual Story Builder (coming soon)', 'url' => '/story-builder/', 'kind' => 'App'],
        ],
    ]) ?>
  </div>
</div>
<style>
.vt-icon-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(64px, 1fr)); gap: .4rem; max-height: 240px; overflow-y: auto; padding: .3rem; border: 1px solid var(--c-line); border-radius: 8px; }
.vt-icon-grid button { background: #fff; border: 2px solid var(--c-line); border-radius: 8px; padding: .35rem; cursor: pointer; }
.vt-icon-grid button[aria-selected="true"] { border-color: var(--c-primary); background: var(--c-primary-tint); }
.vt-icon-grid svg { width: 100%; height: auto; display: block; }
.vt-icon-grid .vt-icon-name { font-size: .62rem; display: block; color: var(--c-ink-soft); }
.vt-board { position: fixed; inset: 0; background: #f7fafa; z-index: 60; display: flex; flex-direction: column; padding: 1rem; }
.vt-panes { flex: 1; display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; min-height: 0; }
.vt-pane { border-radius: 16px; padding: 1rem; display: flex; flex-direction: column; align-items: center; min-height: 0; }
.vt-pane h2 { margin: 0 0 .5rem; letter-spacing: .1em; }
.vt-pane-now { background: #e6f0f0; border: 4px solid #0f5257; }
.vt-pane-next { background: #fdf3df; border: 4px dashed #c97b2d; }
.vt-card { flex: 1; width: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 0; }
.vt-card svg { height: min(38vh, 300px); width: auto; max-width: 100%; }
.vt-card .vt-label { font-size: clamp(1.4rem, 4vw, 2.6rem); font-weight: 800; margin-top: .5rem; text-align: center; }
.vt-timer-zone { display: flex; align-items: center; justify-content: center; gap: 1.5rem; padding-top: 1rem; flex-wrap: wrap; }
#vt-countdown { width: min(30vw, 170px); }
.vt-controls { display: flex; gap: .6rem; flex-wrap: wrap; }
@media (max-width: 640px) { .vt-panes { grid-template-columns: 1fr; } .vt-card svg { height: 22vh; } }
@media print { .vt-board { position: static; } }
</style>
<script src="/assets/js/tools/visual-timer.js" defer></script>
