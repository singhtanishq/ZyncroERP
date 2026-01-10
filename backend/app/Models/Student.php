<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use App\Models\Course;
use App\Models\Batch;
use App\Models\CourseCertificate;

class Student extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'franchise_id',
        'sid',
        'course_id',
        'batch_id',
        'admission_date',
    ];

    protected $casts = [
        'course_id' => 'integer',
        'batch_id'  => 'integer',
    ];

    /* ===================== Relations ===================== */

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function franchise()
    {
        return $this->belongsTo(Franchise::class);
    }

    public function idCard()
    {
        return $this->hasOne(StudentIdCard::class);
    }

    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function batch()
    {
        return $this->belongsTo(Batch::class);
    }

    public function certificate()
    {
        return $this->hasOne(CourseCertificate::class);
    }

    public function admitCards()
    {
        return $this->hasMany(AdmitCard::class);
    }
    
    public function certificates()
    {
        return $this->morphMany(Certificate::class, 'certifiable');
    }
    
    public function enrollments()
    {
        return $this->hasMany(StudentEnrollment::class);
    }
    
    public function activeEnrollment()
    {
        return $this->hasOne(StudentEnrollment::class)
            ->where('status', 'active');
    }
    
    public function documents()
    {
        return $this->hasMany(StudentDocument::class);
    }
    
    public function fees()
    {
        return $this->hasMany(StudentFee::class);
    }
    
    public function assignmentSubmissions()
    {
        return $this->hasMany(
            AssignmentSubmission::class
        );
    }
}
