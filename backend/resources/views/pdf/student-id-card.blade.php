<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Student ID Card</title>
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;700&display=swap" rel="stylesheet">

    <style>
        /* --- FIX START: GLOBAL BOX SIZING --- */
        * {
            box-sizing: border-box;
        }

        @page {
            size: A6 portrait;
            margin: 0;
        }

        html, body {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            font-family: 'Roboto', 'DejaVu Sans', sans-serif;
            background: #f1f5f9;
            -webkit-print-color-adjust: exact;
        }
        /* --- FIX END --- */

        /* Main Container - Acts as the physical card */
        .card-container {
            /* --- FIX START: ABSOLUTE POSITIONING --- */
            /* This forces the card to stay on Page 1 and fills it exactly */
            position: absolute; 
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            /* --- FIX END --- */
            
            background: white;
            overflow: hidden;
            border: 1px solid #e2e8f0;
            z-index: 1;
        }

        /* Decorative Background Elements */
        .bg-circle {
            position: absolute;
            border-radius: 50%;
            z-index: 0;
        }
        .bg-circle-1 {
            width: 300px;
            height: 300px;
            background: #eff6ff;
            top: -100px;
            right: -100px;
        }
        .bg-circle-2 {
            width: 200px;
            height: 200px;
            background: #f8fafc;
            bottom: -50px;
            left: -50px;
        }
        
        /* Watermark Logo */
        .watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            opacity: 0.1;
            width: 70%;
            z-index: 0;
            filter: grayscale(100%);
        }

        /* Header Section */
        .header-strip {
            background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
            color: white;
            padding: 25px 20px;
            text-align: center;
            border-bottom-left-radius: 30px;
            border-bottom-right-radius: 30px;
            position: relative;
            z-index: 10;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .logo-container {
            background: white;
            width: 250px;
            height: 70px;
            margin: 0 auto 10px auto;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 5px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }

        .logo {
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
        }

        .org-name {
            font-size: 16px;
            text-transform: uppercase;
            letter-spacing: 2px;
            font-weight: 700;
            margin-top: 5px;
            color: #E5E4E2;
        }

        /* Content Section */
        .content {
            position: relative;
            z-index: 10;
            padding: 20px 25px;
            text-align: center;
        }

        .student-name {
            font-size: 22px;
            font-weight: 700;
            color: #0f172a;
            margin-bottom: 5px;
            text-transform: uppercase;
        }

        .student-sid {
            font-size: 12px;
            color: #64748b;
            font-weight: 500;
            letter-spacing: 1px;
            background: #f1f5f9;
            padding: 4px 12px;
            border-radius: 15px;
            display: inline-block;
            margin-bottom: 20px;
        }

        /* Table Layout for Details - Best for PDF alignment */
        .details-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            font-size: 11px;
        }

        .details-table td {
            padding: 6px 0;
            border-bottom: 1px solid #f1f5f9;
        }

        .details-table td:last-child {
            border-bottom: none;
        }

        .label {
            color: #64748b;
            font-weight: 600;
            text-align: left;
            width: 35%;
            text-transform: uppercase;
            font-size: 10px;
        }

        .value {
            color: #334155;
            font-weight: 500;
            text-align: right;
            width: 65%;
        }

        /* QR Section */
        .qr-section {
            text-align: center;
            margin-top: auto;
            position: relative;
            z-index: 10;
            padding-bottom: 10px;
        }

        .qr-box {
            background: white;
            padding: 8px;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
            display: inline-block;
        }

        /* Footer */
        .footer-strip {
            background: #0f172a;
            color: white;
            text-align: center;
            padding: 8px;
            font-size: 8px;
            position: absolute;
            bottom: 0;
            width: 100%;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .status-badge {
            font-size: 9px;
            font-weight: bold;
            color: #ef4444; /* Red for expiry */
            margin-top: 5px;
            display: block;
        }

    </style>
</head>

<body>

    <div class="card-container">
        <div class="bg-circle bg-circle-1"></div>
        <div class="bg-circle bg-circle-2"></div>
        
        <img src="{{ public_path('images/logo_color.png') }}" class="watermark">

        {{-- HEADER --}}
        <div class="header-strip">
            <div class="logo-container">
                <img 
                    src="{{ public_path('images/logo_color.png') }}" 
                    class="logo" 
                    alt="Zyncro ERP"
                >
            </div>
            <div class="org-name">Identity Card</div>
        </div>

        {{-- CONTENT --}}
        <div class="content">
            <div class="student-name">{{ $student->user->name }}</div>
            
            <div class="student-sid">ID: {{ $student->sid }}</div>

            <table class="details-table">
                <tr>
                    <td class="label">Date of Birth</td>
                    <td class="value">
                        {{ $student->user->dob ? \Carbon\Carbon::parse($student->user->dob)->format('d M Y') : '-' }}
                    </td>
                </tr>
                
                <tr>
                    <td class="label">Admitted</td>
                    <td class="value">
                        {{ $student->admission_date ? \Carbon\Carbon::parse($student->admission_date)->format('d M Y') : '-' }}
                    </td>
                </tr>
                
                <tr>
                    <td class="label">Valid Till</td>
                    <td class="value" style="color:#16a34a;font-weight:bold;">
                        Lifetime
                    </td>
                </tr>
            </table>

            {{-- QR CODE --}}
            <div class="qr-section">
                <div class="qr-box">
                    <img 
                        src="data:image/png;base64,{{ $qr }}" 
                        width="80" 
                        height="80"
                    >
                </div>
            </div>
        </div>

        {{-- FOOTER --}}
        <div class="footer-strip">
            This card is the property of Zyncro ERP
        </div>
    </div>
</body>
</html>