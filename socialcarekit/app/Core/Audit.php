<?php
declare(strict_types=1);

namespace App\Core;

final class Audit
{
    public static function log(string $action, ?string $entity = null, ?string $entityId = null, string $detail = ''): void
    {
        try {
            $user = Auth::user();
            DB::insert('audit_log', [
                'user_id'    => $user['id'] ?? null,
                'user_email' => $user['email'] ?? null,
                'action'     => $action,
                'entity'     => $entity,
                'entity_id'  => $entityId,
                'detail'     => mb_substr($detail, 0, 5000),
            ]);
        } catch (\Throwable) {
        }
    }
}
