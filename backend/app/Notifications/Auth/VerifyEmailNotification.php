<?php

namespace App\Notifications\Auth;

use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Notifications\Messages\MailMessage;

class VerifyEmailNotification extends VerifyEmail
{
    protected function buildMailMessage($url): MailMessage
    {
        return (new MailMessage())
            ->subject('Verify your Enterprise HRIS account')
            ->greeting('Hello!')
            ->line('Please verify your email address to activate your Enterprise HRIS access.')
            ->action('Verify email', $url)
            ->line('If you did not request access, no further action is required.');
    }
}
