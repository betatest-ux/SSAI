<?php /** Rendered directly (echo view()) with $meta and $popular */ ?>
<?= view('layouts/base', ['meta' => $meta, 'content' => view('pages/404-inner', ['popular' => $popular ?? []])]) ?>
