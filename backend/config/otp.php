<?php

return [

    /*
    |--------------------------------------------------------------------------
    | OTP / verification code policy
    |--------------------------------------------------------------------------
    |
    | All values are configurable through the environment so deployments can
    | tune the balance between security and usability without code changes.
    |
    */

    'expiration_minutes' => (int) env('OTP_EXPIRATION_MINUTES', 5),

    'resend_cooldown_seconds' => (int) env('OTP_RESEND_COOLDOWN_SECONDS', 60),

    'max_attempts' => (int) env('OTP_MAX_ATTEMPTS', 5),

    'max_requests_per_hour' => (int) env('OTP_MAX_REQUESTS_PER_HOUR', 10),

];
