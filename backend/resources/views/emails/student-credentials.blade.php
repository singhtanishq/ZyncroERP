{{-- Student login credentials email (student creation / login reset). --}}
@extends('emails.layout')

@section('title', 'Login Credentials — Zyncro ERP')

@section('content')
<div class="content">
  <p style="margin:0 0 12px;"><span style="color:var(--muted); font-size: 14px;">Hey {{ $studentName }},</span></p>
  <h1>Your login credentials</h1>
  <p class="lead">Your student login credentials have been successfully generated. Please use the details below to log in.</p>
  <div style="margin:18px auto;display:inline-block;border:1px solid rgba(21,75,135,0.14);border-radius:10px;padding:14px 22px;box-shadow:0 4px 12px rgba(0,0,0,0.1);">
    <div style="font-size:16px;font-weight:700;color:var(--text);text-align:left;">
      <span style="color:var(--email-text);font-size:12px;display:block;font-weight:800;letter-spacing:1px;">Email</span>
      <span style="color:var(--accent);font-size:15px;display:block;margin-top:6px;font-weight:800;letter-spacing:1px;">{{ $email }}</span>
    </div>
    <div style="font-size:16px;font-weight:700;color:var(--text);text-align:left;margin-top:14px;">
      <span style="color:var(--email-text);font-size:12px;display:block;font-weight:800;letter-spacing:1px;">Temporary Password</span>
      <span style="color:var(--accent);font-size:15px;display:block;margin-top:6px;font-weight:800;letter-spacing:1px;">{{ $password }}</span>
    </div>
  </div>
  <div class="info-box">
    <div class="meta">
      After logging in, you can change your password by navigating to
      <br><b>Profile → Manage Profile → Change Password</b>.
    </div>
    <hr class="dashed">
    <p style="margin:0;">Need help? Contact us at <a href="mailto:{{ $supportEmail }}" class="contact">{{ $supportEmail }}</a></p>
  </div>
</div>
@endsection

@section('footer')
Have a great learning journey!
@endsection
