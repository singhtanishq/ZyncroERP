<?php

namespace App\Http\Controllers\Franchise;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Franchise\Concerns\ResolvesFranchise;
use Illuminate\Http\Request;

class FranchiseCourseController extends Controller
{
    use ResolvesFranchise;

    /**
     * Courses this franchise's students are enrolled in, with enrollment
     * and fee-collection figures scoped to the franchise.
     */
    public function index(Request $request)
    {
        $franchise = $this->franchise();

        $data = $request->validate([
            'search' => 'nullable|string|max:255',
        ]);

        $students = $franchise->students()->with([
            'enrollments.course:id,name,code,amount,status',
            'fees:id,student_id,course_id,total_fees,paid_fees',
        ])->get(['id']);

        $courses = [];

        foreach ($students as $student) {
            foreach ($student->enrollments as $enrollment) {
                $course = $enrollment->course;

                if (! $course) {
                    continue;
                }

                if (! isset($courses[$course->id])) {
                    $courses[$course->id] = [
                        'id' => $course->id,
                        'course_name' => $course->name,
                        'course_code' => $course->code,
                        'course_amount' => (float) $course->amount,
                        'course_status' => $course->status,
                        'enrollments' => 0,
                        'active_enrollments' => 0,
                        'collected' => 0.0,
                    ];
                }

                $courses[$course->id]['enrollments']++;

                if ($enrollment->status === 'active') {
                    $courses[$course->id]['active_enrollments']++;
                }

                $fee = $student->fees->firstWhere('course_id', $course->id);

                if ($fee) {
                    $courses[$course->id]['collected'] += (float) $fee->paid_fees;
                }
            }
        }

        $result = array_values($courses);

        if (!empty($data['search'])) {
            $search = strtolower($data['search']);

            $result = array_values(array_filter($result, fn ($c) =>
                str_contains(strtolower($c['course_name']), $search)
                || str_contains(strtolower((string) $c['course_code']), $search)
            ));
        }

        usort($result, fn ($a, $b) => strcmp($a['course_name'], $b['course_name']));

        return response()->json(['data' => $result]);
    }
}
