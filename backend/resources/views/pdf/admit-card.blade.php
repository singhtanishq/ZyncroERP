<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Admit Card</title>

    <style>
        @page {
            size: A4 portrait;
            margin: 0;
        }

        body {
            margin: 0;
            padding: 0;
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #333;
            background-color: #fff;
        }

        .page {
            padding: 0;
            width: 100%;
            height: 100%;
            position: relative;
        }

        /* Top decorative strip */
        .top-stripe {
            height: 8px;
            background: #1e40af;
            width: 100%;
        }

        /* Header Section - Now White */
        .header-container {
            padding: 40px 40px 20px 40px;
            text-align: center;
            background-color: #ffffff;
            border-bottom: 2px solid #e5e7eb;
        }

        .logo {
            height: 75px; /* Slightly larger logo */
            margin-bottom: 15px;
        }

        .title {
            font-size: 32px; /* Increased size */
            font-weight: 800;
            color: #1e40af;
            text-transform: uppercase;
            margin: 0;
            letter-spacing: 1px;
        }

        .subtitle {
            font-size: 16px;
            color: #555;
            margin-top: 5px;
            font-weight: 500;
            letter-spacing: 0.5px;
        }

        /* Content Wrapper */
        .content-wrapper {
            padding: 30px 50px;
        }

        /* Section Headings */
        .section-title {
            font-size: 14px;
            color: #1e40af; /* Blue text for headers */
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1.2px;
            border-bottom: 2px solid #1e40af;
            margin-bottom: 20px;
            margin-top: 30px;
            padding-bottom: 8px;
        }

        /* Table Layout for Perfect Alignment */
        .info-table {
            display: table;
            width: 100%;
            border-collapse: separate;
            border-spacing: 0 10px; /* Space between rows */
        }

        .row {
            display: table-row;
        }

        .label {
            display: table-cell;
            width: 30%; /* Fixed width for labels */
            padding: 8px 0;
            font-size: 16px; /* Larger font */
            color: #555;
            font-weight: 600;
            vertical-align: top;
        }

        .value {
            display: table-cell;
            width: 70%;
            padding: 8px 0;
            text-align: right;
            font-size: 18px; /* Larger, bolder font for data */
            color: #000;
            font-weight: bold;
            vertical-align: top;
        }

        /* Mode Badge */
        .mode-badge {
            background-color: #eff6ff;
            color: #1e40af;
            border: 1px solid #1e40af;
            padding: 6px 16px;
            border-radius: 4px;
            font-size: 14px;
            font-weight: bold;
            display: inline-block;
        }

        /* Footer */
        .footer {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            padding: 20px 50px 30px 50px;
            border-top: 1px solid #e5e7eb;
            display: table;
            width: 100%;
            box-sizing: border-box;
            background-color: #fff;
        }

        .footer-left {
            display: table-cell;
            text-align: left;
            vertical-align: middle;
            font-size: 12px;
            color: #888;
        }

        .footer-right {
            display: table-cell;
            text-align: right;
            vertical-align: middle;
            font-size: 12px;
            color: #888;
            font-family: monospace;
        }
    </style>
</head>
<body>

<div class="page">
    <div class="top-stripe"></div>

    <div class="header-container">
        <img src="{{ public_path('images/logo_color.png') }}" class="logo">
        <div class="title">Admit Card</div>
        <div class="subtitle">Examination Hall Ticket</div>
    </div>

    <div class="content-wrapper">
        
        <div class="section-title">Student Information</div>
        <div class="info-table">
            <div class="row">
                <div class="label">Student Name</div>
                <div class="value">{{ $admitCard->student->user->name }}</div>
            </div>
            <div class="row">
                <div class="label">Student ID</div>
                <div class="value">{{ $admitCard->student->sid }}</div>
            </div>
        </div>

        <div class="section-title">Examination Details</div>
        <div class="info-table">
            <div class="row">
                <div class="label">Exam</div>
                <div class="value">{{ $admitCard->exam->name }}</div>
            </div>
            <div class="row">
                <div class="label">Course</div>
                <div class="value">{{ $admitCard->exam->course->name }}</div>
            </div>
            <div class="row">
                <div class="label">Batch</div>
                <div class="value">{{ $admitCard->exam->batch->name }}</div>
            </div>
        </div>

        <div class="section-title">Schedule</div>
        <div class="info-table">
            <div class="row">
                <div class="label">Start Time</div>
                <div class="value">
                    {{ \Carbon\Carbon::parse($admitCard->exam->start_time)->format('d M Y, h:i A') }}
                </div>
            </div>
            <div class="row">
                <div class="label">End Time</div>
                <div class="value">
                    {{ \Carbon\Carbon::parse($admitCard->exam->end_time)->format('d M Y, h:i A') }}
                </div>
            </div>
            <div class="row">
                <div class="label" style="vertical-align: middle;">Mode</div>
                <div class="value">
                    <span class="mode-badge">{{ ucfirst($admitCard->exam->mode) }}</span>
                </div>
            </div>
        </div>

    </div>

    <div class="footer">
        <div class="footer-left">
            <strong>Admit Card ID:</strong> {{ $admitCard->id }}
        </div>
        <div class="footer-right">
            QR Token: {{ $admitCard->qr_token }}
        </div>
    </div>

</div>
</body>
</html>