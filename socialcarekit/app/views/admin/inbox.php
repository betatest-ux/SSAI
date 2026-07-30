<div class="admin-topbar">
  <h1 style="margin:0">Contact &amp; feedback inbox</h1>
  <div class="admin-actions">
    <a class="btn btn-sm <?= !$filter ? 'btn-primary' : 'btn-outline' ?>" href="/admin/inbox/">All</a>
    <a class="btn btn-sm <?= $filter === 'new' ? 'btn-primary' : 'btn-outline' ?>" href="/admin/inbox/?status=new">New</a>
    <a class="btn btn-sm <?= $filter === 'read' ? 'btn-primary' : 'btn-outline' ?>" href="/admin/inbox/?status=read">Read</a>
    <a class="btn btn-sm <?= $filter === 'actioned' ? 'btn-primary' : 'btn-outline' ?>" href="/admin/inbox/?status=actioned">Actioned</a>
  </div>
</div>

<?php foreach ($messages as $m): ?>
<div class="card" style="margin-bottom:1rem">
  <p style="margin:0 0 .4rem">
    <span class="tag <?= $m['msg_type'] === 'tool_error' ? 'tag-ofsted' : '' ?>"><?= $m['msg_type'] === 'tool_error' ? 'Tool error report' : 'Contact' ?></span>
    <span class="rag <?= ['new' => 'rag-red', 'read' => 'rag-amber', 'actioned' => 'rag-green'][$m['status']] ?>"><?= e($m['status']) ?></span>
    <?php if ($m['tool_page']): ?><span class="tag"><?= e($m['tool_page']) ?></span><?php endif; ?>
  </p>
  <p style="margin:0 0 .4rem"><strong><?= e($m['subject'] ?: '(no subject)') ?></strong> — <?= e($m['name'] ?: 'anonymous') ?><?= $m['email'] ? ' &lt;' . e($m['email']) . '&gt;' : '' ?> · <?= e(date('j M Y H:i', strtotime($m['created_at']))) ?></p>
  <p style="white-space:pre-wrap;margin:0 0 .6rem"><?= e($m['message']) ?></p>
  <div class="admin-actions">
    <?php foreach (['read' => 'Mark read', 'actioned' => 'Mark actioned', 'new' => 'Mark new'] as $st => $label): ?>
      <?php if ($m['status'] !== $st): ?>
      <form method="post" action="/admin/inbox/status/" style="display:inline">
        <?= App\Core\Csrf::field() ?>
        <input type="hidden" name="id" value="<?= (int) $m['id'] ?>">
        <input type="hidden" name="status" value="<?= $st ?>">
        <input type="hidden" name="filter" value="<?= e($filter ?? '') ?>">
        <button type="submit" class="btn btn-sm btn-outline"><?= $label ?></button>
      </form>
      <?php endif; ?>
    <?php endforeach; ?>
    <?php if ($m['email']): ?><a class="btn btn-sm btn-ghost" href="mailto:<?= e($m['email']) ?>">Reply by email</a><?php endif; ?>
  </div>
</div>
<?php endforeach; ?>
<?php if (!$messages): ?><p>Inbox zero. ✓</p><?php endif; ?>
