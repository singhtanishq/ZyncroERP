<?php

namespace App\Enums;

enum ExamStatus: string
{
    case UPCOMING = 'upcoming';
    case LIVE = 'live';
    case PAST = 'past';
    case CANCELLED = 'cancelled';
}
