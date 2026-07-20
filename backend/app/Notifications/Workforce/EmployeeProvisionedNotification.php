<?php

namespace App\Notifications\Workforce;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Modules\Workforce\Infrastructure\Persistence\Models\Employee;

class EmployeeProvisionedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private readonly Employee $employee,
        private readonly User $actor,
    ) {
    }

    /**
     * @return list<string>
     */
    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage())
            ->subject('New employee record provisioned')
            ->greeting('Hello!')
            ->line("{$this->employee->full_name} has been added to Enterprise HRIS.")
            ->line("Provisioned by {$this->actor->name}.")
            ->line("Department: {$this->employee->department?->name}")
            ->action('Open HRIS', env('FRONTEND_URL', 'http://localhost:5173'));
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'employee_id' => $this->employee->id,
            'employee_number' => $this->employee->employee_number,
            'full_name' => $this->employee->full_name,
            'department' => $this->employee->department?->name,
            'actor' => [
                'id' => $this->actor->id,
                'name' => $this->actor->name,
                'email' => $this->actor->email,
            ],
        ];
    }
}
