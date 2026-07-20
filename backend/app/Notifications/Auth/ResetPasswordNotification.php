<?php

namespace App\Notifications\Auth;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Notifications\Messages\MailMessage;

class ResetPasswordNotification extends ResetPassword
{
    public function toMail($notifiable): MailMessage
    {
        $frontendUrl = rtrim((string) env('FRONTEND_URL', 'http://localhost:5173'), '/');
        $url = $frontendUrl.'/reset-password?token='.$this->token.'&email='.urlencode($notifiable->getEmailForPasswordReset());

        return (new MailMessage())
            ->subject('Reset your Enterprise HRIS password')
            ->greeting("Hello {$notifiable->name},")
            ->line('We received a request to reset your password.')
            ->action('Reset password', $url)
            ->line('This password reset link will expire in 60 minutes.')
            ->line('If you did not request a password reset, you can ignore this email.');
    }
}
