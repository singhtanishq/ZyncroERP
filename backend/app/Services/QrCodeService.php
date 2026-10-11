<?php

namespace App\Services;

use Endroid\QrCode\Builder\Builder;
use Endroid\QrCode\Writer\PngWriter;

/**
 * Local QR rendering — keeps tokens and verification URLs off third-party
 * QR web services (and works offline).
 */
class QrCodeService
{
    public function png(string $data, int $size = 220, int $margin = 8): string
    {
        $builder = new Builder(
            writer: new PngWriter(),
            data: $data,
            size: $size,
            margin: $margin,
        );

        return $builder->build()->getString();
    }
}
