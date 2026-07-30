<div class="admin-topbar"><h1 style="margin:0">PHP error log</h1></div>
<p class="form-hint">Last 64&nbsp;KB of <code><?= e($file) ?></code>, newest at the bottom.</p>
<?php if ($tail === ''): ?>
<p>Log is empty. ✓</p>
<?php else: ?>
<pre style="background:#1c2b2d;color:#d9e6e6;padding:1rem;border-radius:8px;overflow:auto;max-height:70vh;font-size:.82rem"><?= e($tail) ?></pre>
<?php endif; ?>
