{{-- OTP / verification code email (all OTP flows). --}}
@extends('emails.layout')

@section('title', 'Verification Code — Zyncro ERP')

@section('content')
<div class="content">
  <p style="margin:0 0 12px;font-size:14px;color:var(--muted);">Hey {{ $username }},</p>
  <h1>Verification code</h1>
  <p class="lead">Enter the one-time password below to verify your account.</p>
  <div style="margin:18px auto;display:inline-block;background:transparent;border-radius:10px;border:1px solid rgba(21,75,135,0.14);padding:14px 20px;box-shadow:0 4px 12px rgba(0,0,0,0.1);text-align:center;">
    <div style="font-weight:800;font-size:28px;color:var(--accent);letter-spacing:3px;">
      {{ $otp }}
    </div>
    <div style="margin-top:8px;font-size:12px;color:var(--submuted);">
      One-time password
    </div>
  </div>
  <div class="info-box">
    <div class="meta">
      The verification code expires in <span class="exp">5 minutes</span>.
    </div>
    <hr class="dashed">
    <p style="margin:0;">Need help? Contact us at <a href="mailto:{{ $supportEmail }}" class="contact">{{ $supportEmail }}</a>.</p>
  </div>
</div>
@endsection

@section('footer')
Have a great day!
@endsection
