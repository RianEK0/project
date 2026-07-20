<?php

namespace App\Notifications\Workspace;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class WorkspaceBroadcastNotification extends Notification
{
    use Queueable;

    /**
     * @param  array{
     *     channels: list<string>,
     *     title: string,
     *     subject?: string|null,
     *     message: string,
     *     action_url?: string|null,
     *     action_label?: string|null,
     *     source?: string|null,
     *     sender?: array{id: int, name: string, email: string}|null,
     *     meta?: array<string, mixed>|null
     * }  $payload
     */
    public function __construct(
        private readonly array $payload,
    ) {
    }

    /**
     * @return list<string>
     */
    public function via(object $notifiable): array
    {
        $channels = [];

        if (in_array('in_app', $this->payload['channels'], true)) {
            $channels[] = 'database';
        }

        if (in_array('email', $this->payload['channels'], true)) {
            $channels[] = 'mail';
        }

        return $channels;
    }

    public function toMail(object $notifiable): MailMessage
    {
        $mail = (new MailMessage())
            ->subject($this->payload['subject'] ?: $this->payload['title'])
            ->greeting("Hello {$notifiable->name},")
            ->line($this->payload['message']);

        if (filled($this->payload['action_url'] ?? null)) {
            $mail->action(
                $this->payload['action_label'] ?: 'Open Enterprise HRIS',
                $this->payload['action_url'],
            );
        }

        if (filled($this->payload['sender']['name'] ?? null)) {
            $mail->line("Sent by {$this->payload['sender']['name']}.");
        }

        return $mail;
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title' => $this->payload['title'],
            'subject' => $this->payload['subject'] ?: $this->payload['title'],
            'message' => $this->payload['message'],
            'channels' => $this->payload['channels'],
            'action_url' => $this->payload['action_url'] ?? null,
            'action_label' => $this->payload['action_label'] ?? null,
            'source' => $this->payload['source'] ?? 'workspace',
            'sender' => $this->payload['sender'] ?? null,
            'meta' => $this->payload['meta'] ?? null,
        ];
    }
}
