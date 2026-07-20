<?php

namespace App\Services;

use App\Models\AuthRefreshToken;
use App\Models\AuthSession;
use App\Models\LoginHistory;
use App\Models\PasswordHistory;
use App\Models\User;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Str;
use Modules\Governance\Domain\Contracts\AuditLogRepository;
use Modules\Governance\Infrastructure\Persistence\Models\AuditLog;
use Illuminate\Notifications\DatabaseNotification;

class ModelChangeAuditService
{
    /**
     * @var list<class-string<Model>>
     */
    private array $excludedModels = [
        AuditLog::class,
        AuthSession::class,
        AuthRefreshToken::class,
        LoginHistory::class,
        PasswordHistory::class,
        DatabaseNotification::class,
    ];

    /**
     * @var list<string>
     */
    private array $ignoredKeys = [
        'created_at',
        'updated_at',
    ];

    public function __construct(
        private readonly AuditLogRepository $auditLogs,
    ) {
    }

    public function recordCreated(Model $model): void
    {
        if (! $this->shouldAudit($model)) {
            return;
        }

        $this->auditLogs->create([
            'actor_id' => $this->actor()?->id,
            'auditable_type' => $model->getMorphClass(),
            'auditable_id' => $model->getKey(),
            'action' => $this->actionFor($model, 'created'),
            'summary' => $this->summaryFor($model, 'created'),
            'old_values' => null,
            'new_values' => $this->sanitizePayload($this->snapshot($model)),
            'ip_address' => $this->request()?->ip(),
            'user_agent' => $this->request()?->userAgent(),
            'created_at' => now(),
        ]);
    }

    public function recordUpdated(Model $model): void
    {
        if (! $this->shouldAudit($model)) {
            return;
        }

        $changes = $this->filteredChanges($model->getChanges());

        if ($changes === []) {
            return;
        }

        $previous = $this->normalizeSubset($model, $model->getPrevious(), array_keys($changes));
        $current = $this->normalizeSubset($model, $model->attributesToArray(), array_keys($changes));

        $this->auditLogs->create([
            'actor_id' => $this->actor()?->id,
            'auditable_type' => $model->getMorphClass(),
            'auditable_id' => $model->getKey(),
            'action' => $this->actionFor($model, 'updated'),
            'summary' => $this->summaryFor($model, 'updated'),
            'old_values' => $this->sanitizePayload($previous),
            'new_values' => $this->sanitizePayload($current),
            'ip_address' => $this->request()?->ip(),
            'user_agent' => $this->request()?->userAgent(),
            'created_at' => now(),
        ]);
    }

    public function recordDeleted(Model $model): void
    {
        if (! $this->shouldAudit($model)) {
            return;
        }

        $this->auditLogs->create([
            'actor_id' => $this->actor()?->id,
            'auditable_type' => $model->getMorphClass(),
            'auditable_id' => $model->getKey(),
            'action' => $this->actionFor($model, 'deleted'),
            'summary' => $this->summaryFor($model, 'deleted'),
            'old_values' => $this->sanitizePayload($this->snapshot($model)),
            'new_values' => null,
            'ip_address' => $this->request()?->ip(),
            'user_agent' => $this->request()?->userAgent(),
            'created_at' => now(),
        ]);
    }

    private function shouldAudit(Model $model): bool
    {
        $request = $this->request();

        if (! $request || ! $request->is('api/*')) {
            return false;
        }

        foreach ($this->excludedModels as $excludedModel) {
            if ($model instanceof $excludedModel) {
                return false;
            }
        }

        return true;
    }

    private function request(): ?Request
    {
        if (! app()->bound('request')) {
            return null;
        }

        $request = request();

        return $request instanceof Request ? $request : null;
    }

    private function actor(): ?User
    {
        $request = $this->request();

        if (! $request) {
            return null;
        }

        $actor = $request->user('api') ?? $request->user();

        return $actor instanceof User ? $actor : null;
    }

    /**
     * @return array<string, mixed>
     */
    private function snapshot(Model $model): array
    {
        return $this->filteredPayload($model->attributesToArray());
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    private function filteredPayload(array $payload): array
    {
        return Arr::except($payload, $this->ignoredKeys);
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    private function filteredChanges(array $payload): array
    {
        return Arr::except($payload, $this->ignoredKeys);
    }

    /**
     * @param  array<string, mixed>  $payload
     * @param  list<string>  $keys
     * @return array<string, mixed>
     */
    private function normalizeSubset(Model $model, array $payload, array $keys): array
    {
        $normalized = [];

        foreach ($keys as $key) {
            if (! array_key_exists($key, $payload)) {
                continue;
            }

            $normalized[$key] = $this->normalizeValue(
                $model,
                $key,
                $payload[$key],
            );
        }

        return $normalized;
    }

    private function normalizeValue(Model $model, string $key, mixed $value): mixed
    {
        if ($value === null) {
            return null;
        }

        if ($value instanceof CarbonInterface) {
            return $value->toISOString();
        }

        $cast = $model->getCasts()[$key] ?? null;

        if ($cast === null) {
            return $value;
        }

        return match (true) {
            in_array($cast, ['int', 'integer'], true) => (int) $value,
            in_array($cast, ['real', 'float', 'double'], true) => (float) $value,
            in_array($cast, ['bool', 'boolean'], true) => (bool) $value,
            Str::startsWith($cast, 'decimal:') => (float) $value,
            in_array($cast, ['array', 'json', 'object', 'collection'], true) => is_string($value)
                ? json_decode($value, true) ?? $value
                : $value,
            $cast === 'date' => (string) \Carbon\Carbon::parse($value)->toDateString(),
            Str::contains($cast, 'datetime') => (string) \Carbon\Carbon::parse($value)->toISOString(),
            default => $value,
        };
    }

    /**
     * @param  array<string, mixed>|null  $payload
     * @return array<string, mixed>|null
     */
    private function sanitizePayload(?array $payload): ?array
    {
        if ($payload === null) {
            return null;
        }

        $sanitized = [];

        foreach ($payload as $key => $value) {
            $sanitized[$key] = $this->sanitizeValue((string) $key, $value);
        }

        return $sanitized;
    }

    private function sanitizeValue(string $key, mixed $value): mixed
    {
        if ($this->isSensitiveKey($key)) {
            return '[REDACTED]';
        }

        if (is_array($value)) {
            $sanitized = [];

            foreach ($value as $nestedKey => $nestedValue) {
                $sanitized[$nestedKey] = $this->sanitizeValue((string) $nestedKey, $nestedValue);
            }

            return $sanitized;
        }

        return $value;
    }

    private function isSensitiveKey(string $key): bool
    {
        $normalized = Str::lower($key);

        foreach (['password', 'secret', 'token', 'otp', 'recovery', 'remember', 'qr_'] as $needle) {
            if (Str::contains($normalized, $needle)) {
                return true;
            }
        }

        return false;
    }

    private function actionFor(Model $model, string $verb): string
    {
        return 'record.'.Str::of(class_basename($model))->kebab()->toString().'.'.$verb;
    }

    private function summaryFor(Model $model, string $verb): string
    {
        $label = Str::of(class_basename($model))->headline()->toString();
        $identifier = $this->identifierFor($model);

        if ($identifier !== null) {
            return "{$label} {$identifier} {$verb}.";
        }

        return "{$label} {$verb}.";
    }

    private function identifierFor(Model $model): ?string
    {
        foreach (['employee_number', 'candidate_code', 'code', 'contract_number', 'title', 'name', 'email'] as $attribute) {
            $value = $model->getAttribute($attribute);

            if (is_string($value) && $value !== '') {
                return $value;
            }
        }

        $key = $model->getKey();

        return $key !== null ? '#'.$key : null;
    }
}
