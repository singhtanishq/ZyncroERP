<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Certificate of Completion</title>

    <style>
        @page {
            size: A4 landscape;
            margin: 0;
        }

        body {
            margin: 0;
            padding: 0;
            font-family: 'Times New Roman', Times, serif;
            background-color: #fff;
            color: #333;
        }

        .frame {
            position: absolute;
            top: 10mm;
            left: 10mm;
            right: 10mm;
            bottom: 10mm;
            border: 2px solid #1e40af;
            padding: 5mm;
        }

        .frame-inner {
            border: 5px double #D4AF37;
            height: 94%;
            width: 99%;
            box-sizing: border-box;
            position: relative;
        }

        .watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            opacity: 0.1;
            width: 400px;
            z-index: 0;
        }

        .content-wrapper {
            position: relative;
            z-index: 10;
            text-align: center;
            padding-top: 40px;
        }

        .logo {
            margin-bottom: 20px;
            margin-top: -20px;
        }

        .title {
            font-size: 36px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 2px;
            color: #1e40af;
            margin-bottom: 10px;
        }

        .subtitle {
            font-size: 18px;
            font-style: italic;
            color: #555;
            margin-bottom: 30px;
        }

        .student-name {
            font-size: 42px;
            font-weight: bold;
            color: #000;
            margin: 10px 0 30px 0;
            border-bottom: 1px solid #ddd;
            display: inline-block;
            padding: 0 40px 10px 40px;
            font-family: 'Georgia', serif;
        }

        .course-text {
            font-size: 20px;
            line-height: 1.6;
            margin-bottom: 10px;
            margin-top: -20px;
            color: #444;
        }

        .course-title {
            font-size: 24px;
            font-weight: bold;
            color: #1e40af;
            display: block;
            margin: 10px 0;
        }

        .details {
            font-size: 16px;
            margin-top: 20px;
            color: #666;
        }

        .footer-table {
            width: 80%;
            margin: 30px auto 0 auto;
            border-collapse: collapse;
        }

        .footer-table td {
            width: 33%;
            vertical-align: bottom;
            text-align: center;
        }

        .signature-line {
            border-top: 1px solid #333;
            width: 80%;
            margin: 0 auto 5px auto;
        }

        .footer-label {
            font-size: 12px;
            color: #777;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .footer-value {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 5px;
            color: #000;
        }

        .seal {
            position: absolute;
            bottom: 32px;
            right: 180px;
            width: 110px;
            height: 110px;
            border-radius: 50%;
            border: 2px solid #D4AF37;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #D4AF37;
            font-size: 10px;
            font-weight: bold;
            text-transform: uppercase;
            text-align: center;
            opacity: 0.8;
            transform: rotate(-15deg);
        }

        .qr {
            position: absolute;
            bottom: 28px;
            left: 178px;
            text-align: center;
        }

        .qr img {
            width: 110px;
        }

        .qr-text {
            font-size: 14px;
            color: #555;
            margin-top: 5px;
        }
    </style>
</head>

<body>

<div class="frame">
    <div class="frame-inner">

        <img src="{{ public_path('images/logo_color.png') }}" class="watermark">

        <div class="seal">
            Official<br>Certified<br>Valid
        </div>

        {{-- QR Code --}}
        <div class="qr">
            <img src="data:image/png;base64,{{ $qr }}">
            <div class="qr-text">Scan to Verify</div>
        </div>

        <div class="content-wrapper">

            <img src="{{ public_path('images/logo_color.png') }}" height="70" class="logo">

            <div class="title">Certificate of Completion</div>
            <div class="subtitle">This is to certify that</div>

            <div class="student-name">
                {{ $certificate->certifiable->user->name ?? 'N/A' }}
            </div>

            <div class="course-text">
                has successfully completed the course
                <span class="course-title">
                    {{ $certificate->course->name ?? 'N/A' }}
                </span>
            </div>

            <div class="details">
                Batch:
                <strong>{{ $certificate->batch->name ?? 'N/A' }}</strong>
                &nbsp;|&nbsp;
                Score:
                <strong>{{ number_format($certificate->score, 2) }}%</strong>
            </div>

            <table class="footer-table">
                <tr>
                    <td>
                        <div class="footer-value">
                            {{ optional($certificate->issued_at)->format('d M Y') }}
                        </div>
                        <div class="signature-line"></div>
                        <div class="footer-label">Date Issued</div>
                    </td>

                    <td></td>

                    <td>
                        <div class="footer-value">
                            {{ $certificate->certificate_number ?? 'N/A' }}
                        </div>
                        <div class="signature-line"></div>
                        <div class="footer-label">Certificate No</div>
                    </td>
                </tr>
            </table>

        </div>
    </div>
</div>

</body>
</html>
