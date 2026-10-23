<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\EmailService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class GenerateStudentLoginController extends Controller
{
    public function generate($userId)
    {
        $plainPassword = Str::random(32);

        $user = DB::transaction(function () use ($userId, $plainPassword) {

            $user = User::where('id', $userId)
                ->where('role', 'student')
                ->firstOrFail();

            $user->password = Hash::make($plainPassword);
            $user->save();

            return $user;
        });

        $mailResult = app(EmailService::class)->studentCredentials(
            $user->email,
            $user->name,
            $plainPassword
        );

        $message = 'Credentials reset and emailed successfully';

        if (! ($mailResult['ok'] ?? false)) {
            $message = 'Credentials were reset, but the email could not be sent. Try again.';
        }

        return response()->json([
            'message' => $message
        ]);
    }
}
