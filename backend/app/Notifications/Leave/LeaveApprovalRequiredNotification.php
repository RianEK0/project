<?php

namespace App\Notifications\Leave;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Modules\Leave\Infrastructure\Persistence\Models\LeaveApproval;
use Modules\Leave\Infrastructure\Persistence\Models\LeaveRequest;

class LeaveApprovalRequiredNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private readonly LeaveRequest $leaveRequest,
        private readonly LeaveApproval $approval,
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
        $employee = $this->leaveRequest->employee;
        $leaveType = $this->leaveRequest->leaveType;

        return (new MailMessage())
            ->subject('Leave approval required')
            ->greeting("Hello {$notifiable->name},")
            ->line("A leave request from {$employee?->full_name} requires your approval.")
            ->line("Leave type: {$leaveType?->name}")
            ->line("Period: {$this->leaveRequest->start_date?->toDateString()} to {$this->leaveRequest->end_date?->toDateString()}")
            ->action('Open approval inbox', env('FRONTEND_URL', 'http://localhost:5173'));
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'leave_request_id' => $this->leaveRequest->id,
            'stage' => $this->approval->stage,
            'employee' => $this->leaveRequest->employee?->full_name,
            'leave_type' => $this->leaveRequest->leaveType?->name,
            'start_date' => $this->leaveRequest->start_date,
            'end_date' => $this->leaveRequest->end_date,
        ];
    }
}
