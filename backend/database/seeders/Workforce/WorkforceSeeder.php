<?php

namespace Database\Seeders\Workforce;

use Illuminate\Database\Seeder;
use Modules\Workforce\Infrastructure\Persistence\Models\Branch;
use Modules\Workforce\Infrastructure\Persistence\Models\Company;
use Modules\Workforce\Infrastructure\Persistence\Models\Department;
use Modules\Workforce\Infrastructure\Persistence\Models\Division;
use Modules\Workforce\Infrastructure\Persistence\Models\Employee;
use Modules\Workforce\Infrastructure\Persistence\Models\EmployeeContract;
use Modules\Workforce\Infrastructure\Persistence\Models\EmployeeSalaryHistory;
use Modules\Workforce\Infrastructure\Persistence\Models\Position;
use Modules\Workforce\Infrastructure\Persistence\Models\Section;

class WorkforceSeeder extends Seeder
{
    public function run(): void
    {
        $departments = [
            ['name' => 'Human Resources', 'code' => 'HR', 'cost_center' => 'CC-100'],
            ['name' => 'Engineering', 'code' => 'ENG', 'cost_center' => 'CC-200'],
            ['name' => 'Finance', 'code' => 'FIN', 'cost_center' => 'CC-300'],
            ['name' => 'Operations', 'code' => 'OPS', 'cost_center' => 'CC-400'],
        ];

        foreach ($departments as $department) {
            Department::query()->updateOrCreate(
                ['code' => $department['code']],
                $department + ['description' => null],
            );
        }

        $company = Company::query()->updateOrCreate(
            ['code' => 'ENT-HRIS'],
            [
                'name' => 'Enterprise HRIS',
                'legal_name' => 'PT Enterprise Human Resource Information System',
                'email' => 'hello@enterprise-hris.local',
                'phone' => '+62-21-555-0000',
                'website' => 'https://enterprise-hris.local',
                'address' => 'Sudirman Central Business District, Jakarta',
                'description' => 'Enterprise workforce and people operations group.',
            ],
        );

        $jakartaBranch = Branch::query()->updateOrCreate(
            ['code' => 'JKT-HQ'],
            [
                'company_id' => $company->id,
                'name' => 'Jakarta HQ',
                'address' => 'Sudirman Central Business District, Jakarta',
                'phone' => '+62-21-555-1000',
                'is_active' => true,
            ],
        );

        $bandungBranch = Branch::query()->updateOrCreate(
            ['code' => 'BDG-HUB'],
            [
                'company_id' => $company->id,
                'name' => 'Bandung Hub',
                'address' => 'Jl. Asia Afrika, Bandung',
                'phone' => '+62-22-555-2200',
                'is_active' => true,
            ],
        );

        $engineering = Department::query()->where('code', 'ENG')->firstOrFail();
        $hr = Department::query()->where('code', 'HR')->firstOrFail();

        $platformDivision = Division::query()->updateOrCreate(
            ['code' => 'ENG-PLATFORM'],
            [
                'department_id' => $engineering->id,
                'name' => 'Platform',
                'description' => 'Platform engineering and architecture.',
            ],
        );

        $peopleDivision = Division::query()->updateOrCreate(
            ['code' => 'HR-PEOPLE-OPS'],
            [
                'department_id' => $hr->id,
                'name' => 'People Operations',
                'description' => 'HR operations and people support.',
            ],
        );

        $platformSection = Section::query()->updateOrCreate(
            ['code' => 'ENG-PLATFORM-CORE'],
            [
                'division_id' => $platformDivision->id,
                'name' => 'Platform Core',
                'description' => 'Backend platform and core service delivery.',
            ],
        );

        $peopleServiceSection = Section::query()->updateOrCreate(
            ['code' => 'HR-PEOPLE-SVC'],
            [
                'division_id' => $peopleDivision->id,
                'name' => 'People Service',
                'description' => 'Employee administration and people support.',
            ],
        );

        $headOfEngineering = Position::query()->updateOrCreate(
            ['code' => 'POS-HOE'],
            [
                'division_id' => $platformDivision->id,
                'section_id' => $platformSection->id,
                'name' => 'Head of Engineering',
                'grade' => 'G11',
                'description' => 'Leads engineering delivery and people strategy.',
            ],
        );

        $seniorHrBp = Position::query()->updateOrCreate(
            ['code' => 'POS-SHRBP'],
            [
                'division_id' => $peopleDivision->id,
                'section_id' => $peopleServiceSection->id,
                'name' => 'Senior HR Business Partner',
                'grade' => 'G8',
                'description' => 'Drives HR partnership for business units.',
            ],
        );

        $backendEngineer = Position::query()->updateOrCreate(
            ['code' => 'POS-BE'],
            [
                'division_id' => $platformDivision->id,
                'section_id' => $platformSection->id,
                'name' => 'Backend Engineer',
                'grade' => 'G6',
                'description' => 'Builds and maintains backend services.',
            ],
        );

        $manager = Employee::query()->firstWhere('employee_number', 'EMP-0001');

        if (! $manager) {
            $manager = Employee::query()->create([
                'employee_number' => 'EMP-0001',
                'first_name' => 'Alya',
                'last_name' => 'Pratama',
                'gender' => 'female',
                'marital_status' => 'married',
                'place_of_birth' => 'Jakarta',
                'city' => 'Jakarta',
                'country' => 'Indonesia',
                'identity_card_number' => '3175010101900001',
                'npwp_number' => '12.345.678.9-012.000',
                'bpjs_health_number' => '0001112223334',
                'bpjs_employment_number' => '9988776655443',
                'work_email' => 'alya.pratama@enterprise-hris.local',
                'job_title' => 'Head of Engineering',
                'employment_type' => 'permanent',
                'employment_status' => 'active',
                'department_id' => $engineering->id,
                'branch_id' => $jakartaBranch->id,
                'division_id' => $platformDivision->id,
                'section_id' => $platformSection->id,
                'position_id' => $headOfEngineering->id,
                'hire_date' => now()->subYears(4)->toDateString(),
                'birth_date' => now()->subYears(32)->toDateString(),
                'family' => [
                    [
                        'name' => 'Dian Pratama',
                        'relationship' => 'Spouse',
                        'birth_date' => now()->subYears(31)->toDateString(),
                        'occupation' => 'Product Manager',
                        'dependent' => true,
                    ],
                ],
                'emergency_contacts' => [
                    [
                        'name' => 'Dian Pratama',
                        'relationship' => 'Spouse',
                        'phone' => '+628111111111',
                        'email' => 'dian@example.com',
                    ],
                ],
                'educations' => [
                    [
                        'institution' => 'Institut Teknologi Bandung',
                        'degree' => 'Bachelor',
                        'major' => 'Informatics',
                        'start_year' => 2010,
                        'end_year' => 2014,
                        'gpa' => 3.72,
                    ],
                ],
                'skills' => [
                    [
                        'name' => 'Engineering Leadership',
                        'category' => 'Leadership',
                        'level' => 'expert',
                    ],
                ],
            ]);
        }

        $hrPartner = Employee::query()->firstWhere('employee_number', 'EMP-0002');

        if (! $hrPartner) {
            $hrPartner = Employee::query()->create([
                'employee_number' => 'EMP-0002',
                'first_name' => 'Rafi',
                'last_name' => 'Saputra',
                'gender' => 'male',
                'marital_status' => 'married',
                'place_of_birth' => 'Bandung',
                'city' => 'Bandung',
                'country' => 'Indonesia',
                'identity_card_number' => '3273010102920002',
                'npwp_number' => '98.765.432.1-210.000',
                'bpjs_health_number' => '4445556667778',
                'bpjs_employment_number' => '1122334455667',
                'work_email' => 'rafi.saputra@enterprise-hris.local',
                'job_title' => 'Senior HR Business Partner',
                'employment_type' => 'permanent',
                'employment_status' => 'active',
                'department_id' => $hr->id,
                'branch_id' => $jakartaBranch->id,
                'division_id' => $peopleDivision->id,
                'section_id' => $peopleServiceSection->id,
                'position_id' => $seniorHrBp->id,
                'hire_date' => now()->subYears(3)->toDateString(),
                'birth_date' => now()->subYears(30)->toDateString(),
                'bank_accounts' => [
                    [
                        'bank_name' => 'Bank Mandiri',
                        'account_name' => 'Rafi Saputra',
                        'account_number' => '1234567890123',
                        'branch' => 'Jakarta Sudirman',
                        'is_primary' => true,
                    ],
                ],
            ]);
        }

        $engineer = Employee::query()->firstWhere('employee_number', 'EMP-0003');

        if (! $engineer) {
            $engineer = Employee::query()->create([
                'employee_number' => 'EMP-0003',
                'first_name' => 'Nadia',
                'last_name' => 'Putri',
                'gender' => 'female',
                'marital_status' => 'single',
                'place_of_birth' => 'Surabaya',
                'city' => 'Bandung',
                'country' => 'Indonesia',
                'identity_card_number' => '3578010103990003',
                'passport_number' => 'A1234567',
                'passport_expiry_date' => now()->addYears(4)->toDateString(),
                'npwp_number' => '45.678.912.3-111.000',
                'bpjs_health_number' => '2223334445556',
                'bpjs_employment_number' => '7778889990001',
                'work_email' => 'nadia.putri@enterprise-hris.local',
                'job_title' => 'Backend Engineer',
                'employment_type' => 'permanent',
                'employment_status' => 'active',
                'department_id' => $engineering->id,
                'branch_id' => $bandungBranch->id,
                'division_id' => $platformDivision->id,
                'section_id' => $platformSection->id,
                'position_id' => $backendEngineer->id,
                'manager_id' => $manager->id,
                'hire_date' => now()->subMonths(2)->toDateString(),
                'birth_date' => now()->subYears(27)->toDateString(),
                'experiences' => [
                    [
                        'company' => 'Tech Nusantara',
                        'position' => 'Junior Backend Engineer',
                        'start_date' => now()->subYears(2)->toDateString(),
                        'end_date' => now()->subMonths(3)->toDateString(),
                        'description' => 'Maintained internal payroll and attendance APIs.',
                    ],
                ],
                'certifications' => [
                    [
                        'name' => 'AWS Certified Developer',
                        'issuer' => 'Amazon Web Services',
                        'credential_id' => 'AWS-DEV-00123',
                        'issued_at' => now()->subYear()->toDateString(),
                        'expires_at' => now()->addYears(2)->toDateString(),
                    ],
                ],
            ]);
        }

        $jakartaBranch->forceFill([
            'company_id' => $company->id,
            'head_employee_id' => $manager->id,
        ])->save();

        $bandungBranch->forceFill([
            'company_id' => $company->id,
            'head_employee_id' => $engineer->id,
        ])->save();

        $engineering->forceFill(['head_employee_id' => $manager->id])->save();
        $hr->forceFill(['head_employee_id' => $hrPartner->id])->save();
        $platformDivision->forceFill(['head_employee_id' => $manager->id])->save();
        $peopleDivision->forceFill(['head_employee_id' => $hrPartner->id])->save();
        $platformSection->forceFill(['head_employee_id' => $manager->id])->save();
        $peopleServiceSection->forceFill(['head_employee_id' => $hrPartner->id])->save();

        EmployeeSalaryHistory::query()->firstOrCreate([
            'employee_id' => $manager->id,
            'component' => 'Base Salary',
        ], [
            'amount' => 35000000,
            'currency' => 'IDR',
            'pay_frequency' => 'monthly',
            'effective_date' => now()->subYear()->toDateString(),
            'is_current' => true,
        ]);

        EmployeeSalaryHistory::query()->firstOrCreate([
            'employee_id' => $manager->id,
            'component' => 'Leadership Allowance',
        ], [
            'amount' => 5000000,
            'currency' => 'IDR',
            'pay_frequency' => 'monthly',
            'effective_date' => now()->subYear()->toDateString(),
            'is_current' => true,
        ]);

        EmployeeSalaryHistory::query()->firstOrCreate([
            'employee_id' => $hrPartner->id,
            'component' => 'Base Salary',
        ], [
            'amount' => 22000000,
            'currency' => 'IDR',
            'pay_frequency' => 'monthly',
            'effective_date' => now()->subYear()->toDateString(),
            'is_current' => true,
        ]);

        EmployeeSalaryHistory::query()->firstOrCreate([
            'employee_id' => $hrPartner->id,
            'component' => 'People Operations Allowance',
        ], [
            'amount' => 2500000,
            'currency' => 'IDR',
            'pay_frequency' => 'monthly',
            'effective_date' => now()->subYear()->toDateString(),
            'is_current' => true,
        ]);

        EmployeeSalaryHistory::query()->firstOrCreate([
            'employee_id' => $engineer->id,
            'component' => 'Base Salary',
        ], [
            'amount' => 15000000,
            'currency' => 'IDR',
            'pay_frequency' => 'monthly',
            'effective_date' => now()->subMonths(2)->toDateString(),
            'is_current' => true,
        ]);

        EmployeeSalaryHistory::query()->firstOrCreate([
            'employee_id' => $engineer->id,
            'component' => 'Transport Allowance',
        ], [
            'amount' => 1500000,
            'currency' => 'IDR',
            'pay_frequency' => 'monthly',
            'effective_date' => now()->subMonths(2)->toDateString(),
            'is_current' => true,
        ]);

        EmployeeSalaryHistory::query()->firstOrCreate([
            'employee_id' => $engineer->id,
            'component' => 'Communication Allowance',
        ], [
            'amount' => 750000,
            'currency' => 'IDR',
            'pay_frequency' => 'monthly',
            'effective_date' => now()->subMonths(2)->toDateString(),
            'is_current' => true,
        ]);

        EmployeeContract::query()->firstOrCreate([
            'employee_id' => $engineer->id,
            'contract_type' => 'permanent',
            'contract_number' => 'CTR-EMP-0003',
        ], [
            'start_date' => now()->subMonths(2)->toDateString(),
            'status' => 'active',
            'notes' => 'Converted from probation after onboarding.',
        ]);
    }
}
