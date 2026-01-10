{{-- Shared frame for all Zyncro ERP transactional emails. --}}
{{-- Design preserved from the original custom HTML templates. --}}
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>@yield('title', 'Zyncro ERP')</title>
  <style>
    :root{
      --bg: #f4f6fb;
      --page-pad: 32px 12px;
      --card-bg: linear-gradient(180deg,#ffffff 0%, #fbfdff 100%);
      --text:#0f1724;
      --muted:#475569;
      --submuted:#9aa4bf;
      --accent:#154b87;
      --border: rgba(15,23,36,0.06);
      --shadow: 0 8px 28px rgba(0,0,0,0.12);
      --email-text: #6b7280;
    }

    @media (prefers-color-scheme: dark){
      :root{
        --bg:#0b1020;
        --card-bg: linear-gradient(180deg,#071022 0%, #081427 100%);
        --text:#e6eef8;
        --muted:#b7c4db;
        --submuted:#8f9fb8;
        --accent:#7ea4ff;
        --border: rgba(255,255,255,0.06);
        --shadow: 0 8px 28px rgba(0,0,0,0.45);
        --email-text: #b7c4db;
      }
    }

    html,body{
      margin:0; padding:0;
      background:var(--bg);
      font-family:"Lato","Helvetica Neue",Arial,sans-serif;
      color:var(--text);
      -webkit-font-smoothing:antialiased;
    }

    .email-bg{ width:100%; background:var(--bg); padding:var(--page-pad); box-sizing:border-box; }
    .container{ max-width:600px; width:100%; margin:0 auto; }

    .card{
      background:var(--card-bg);
      border-radius:14px;
      border:1px solid var(--border);
      overflow:hidden;
      display:block;
      box-shadow: var(--shadow);
    }

    .content{ padding:24px 28px; text-align:center; }
    h1{ margin:0 0 8px; font-size:18px; font-weight:700; color:var(--text); }

    p.lead{ margin:6px 0 18px; color:var(--muted); font-size:14px; line-height:1.6; }

    .info-box{
      margin-top:20px;
      padding:14px 18px;
      border-radius:10px;
      border:1px dashed rgba(148,163,184,0.55);
      background:rgba(148,163,184,0.03);
      font-size:13px;
    }

    .meta{
      margin-top:0;
      font-size:13px;
      color:#b30000;
      font-weight:600;
    }

    hr.dashed{
      border:0;
      border-top:1px dotted rgba(0,0,0,0.12);
      margin:14px 0 10px;
    }

    @media (prefers-color-scheme: dark){
      hr.dashed{ border-top-color:rgba(255,255,255,0.12); }
      .info-box{
        border-color:rgba(148,163,184,0.6);
        background:rgba(15,23,42,0.6);
      }
    }

    .footer{ padding:18px 28px 28px; text-align:center; font-size:13px; color:var(--submuted); }
    .brand{ margin-top:6px; font-weight:700; color:var(--text); font-size:15px; }
    .sub-brand{ margin-top:2px; font-size:9px; color:var(--submuted); }

    a.contact{
      color:#0066ff;
      font-weight:600;
      text-decoration:none;
    }

    @media only screen and (max-width:480px){
      .content{ padding:20px 16px; }
    }
  </style>
</head>
<body>
  <table role="presentation" class="email-bg" width="100%" align="center">
   <tbody>
    <tr>
     <td align="center">
      <table role="presentation" class="container" width="100%">
       <tbody>
        <tr>
         <td>
          <div style="background: #ffffff; border: 1px dashed rgba(148,163,184,0.55); border-radius: 14px; padding: 18px; margin-bottom: 18px; text-align: center;">
           <img src="{{ $logoUrl }}" alt="Zyncro ERP" width="140" height="140" style="max-width: 40%; height: auto; display: block; margin: 0 auto;">
          </div></td>
        </tr>
        <tr>
         <td align="center">
          <div class="card">
            @yield('content')
            <div class="footer">
              @yield('footer')
              <div class="brand">Zyncro ERP</div>
              <div class="sub-brand">Secure System</div>
            </div>
          </div></td>
        </tr>
       </tbody>
      </table></td>
    </tr>
   </tbody>
  </table>
</body>
</html>
