<?php

namespace App\Enums;

enum AdmitCardStatus: string
{
    case NOT_GENERATED = 'not_generated';
    case GENERATED = 'generated';
    case INVALIDATED = 'invalidated';
}
