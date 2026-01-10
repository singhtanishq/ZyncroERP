<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Student;
use App\Models\Faculty;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class UserApprovalController extends Controller
{
    public function approve(Request $request, $userId)
    {
        return DB::transaction(function () use ($userId) {

            $user = User::where('id', $userId)
                ->where('approve_status', false)
                ->lockForUpdate()
                ->firstOrFail();
            
            /*
            |--------------------------------------------------------------------------
            | Approve User
            |--------------------------------------------------------------------------
            */
            
            $user->approve_status = true;
            $user->save();
            
            /*
            |--------------------------------------------------------------------------
            | Student
            |--------------------------------------------------------------------------
            */
            
            if ($user->role === 'student') {
            
                Student::firstOrCreate(
                    ['user_id' => $user->id],
                    [
                        'sid' => $this->generateSid(),
                        'course_id' => null,
                        'batch_id'  => null,
                    ]
                );
            
                return response()->json([
                    'message' => 'Student approved successfully'
                ]);
            }
            
            /*
            |--------------------------------------------------------------------------
            | Faculty
            |--------------------------------------------------------------------------
            */
            
            if ($user->role === 'faculty') {
            
                Faculty::firstOrCreate(
                    [
                        'user_id' => $user->id,
                    ],
                    [
                        'name'  => $user->name,
                        'email' => $user->email,
                        'code'  => $this->generateFacultyCode(),
                        'phone' => '',
                    ]
                );
            
                return response()->json([
                    'message' => 'Faculty approved successfully'
                ]);
            }
            
            /*
            |--------------------------------------------------------------------------
            | Future Roles
            |--------------------------------------------------------------------------
            */
            
            return response()->json([
                'message' => 'User approved successfully'
            ]);
        });
    }

    private function generateSid(): string
    {
        do {
            $sid = str_pad((string) random_int(0, 99999999), 8, '0', STR_PAD_LEFT);
        } while (Student::where('sid', $sid)->exists());

        return $sid;
    }
    
    private function generateFacultyCode(): string
    {
        $lastFaculty = Faculty::latest('id')->lockForUpdate()->first();
    
        $nextNumber = $lastFaculty
            ? ((int) substr($lastFaculty->code, 3)) + 1
            : 1;
    
        return 'FAC' . str_pad(
            $nextNumber,
            4,
            '0',
            STR_PAD_LEFT
        );
    }

}
