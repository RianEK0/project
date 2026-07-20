<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Modules\Workforce\Domain\Contracts\EmployeeRepository;

class PublishDailyWorkforceSnapshotCommand extends Command
{
    protected $signature = 'hris:daily-workforce-snapshot';

    protected $description = 'Publish a daily workforce snapshot to the application log';

    public function handle(EmployeeRepository $employees): int
    {
        $metrics = $employees->metrics();

        Log::info('Daily workforce snapshot generated.', $metrics);

        $this->info('Daily workforce snapshot generated successfully.');

        return self::SUCCESS;
    }
}
