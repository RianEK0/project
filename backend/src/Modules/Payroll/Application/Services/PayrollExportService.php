<?php

namespace Modules\Payroll\Application\Services;

use Modules\Payroll\Infrastructure\Persistence\Models\PayrollItem;
use Modules\Payroll\Infrastructure\Persistence\Models\PayrollRun;

class PayrollExportService
{
    public function buildPayslipPdf(PayrollItem $item): string
    {
        $item->loadMissing(['employee.department', 'employee.position', 'payrollRun']);

        $lines = [
            'Enterprise HRIS Payroll Payslip',
            '',
            'Payroll Month: '.$item->payrollRun?->payroll_month,
            'Employee: '.$item->employee?->full_name,
            'Employee Number: '.$item->employee?->employee_number,
            'Department: '.($item->employee?->department?->name ?? 'N/A'),
            'Position: '.($item->employee?->position?->name ?? $item->employee?->job_title ?? 'N/A'),
            '',
            'Basic Salary: '.$this->money($item->basic_salary, $item->currency),
            'Allowance: '.$this->money($item->allowance_amount, $item->currency),
            'Overtime: '.$this->money($item->overtime_amount, $item->currency).' ('.$item->overtime_minutes.' minutes)',
            'Bonus: '.$this->money($item->bonus_amount, $item->currency),
            'THR: '.$this->money($item->thr_amount, $item->currency),
            'Gross Pay: '.$this->money($item->gross_amount, $item->currency),
            '',
            'Deduction: '.$this->money($item->deduction_amount, $item->currency),
            'Tax: '.$this->money($item->tax_amount, $item->currency),
            'BPJS: '.$this->money($item->bpjs_amount, $item->currency),
            'Net Pay: '.$this->money($item->net_amount, $item->currency),
        ];

        if ($item->notes) {
            $lines[] = '';
            $lines[] = 'Notes: '.$item->notes;
        }

        return $this->buildPdf($lines);
    }

    public function buildPayrollRunPdf(PayrollRun $run): string
    {
        $run->loadMissing(['items.employee', 'submitter', 'reviewer']);

        $lines = [
            'Enterprise HRIS Payroll Run',
            '',
            'Payroll Month: '.$run->payroll_month,
            'Title: '.$run->title,
            'Status: '.$run->status,
            'Period: '.$run->period_start?->toDateString().' to '.$run->period_end?->toDateString(),
            'Submitted By: '.($run->submitter?->name ?? 'N/A'),
            'Reviewer: '.($run->reviewer?->name ?? 'N/A'),
            '',
        ];

        foreach ($run->items->take(20) as $item) {
            $lines[] = ($item->employee?->full_name ?? 'Employee').' - '.$this->money($item->net_amount, $item->currency);
        }

        if ($run->items->count() > 20) {
            $lines[] = '...and '.($run->items->count() - 20).' more employee(s)';
        }

        return $this->buildPdf($lines);
    }

    public function buildPayrollRunExcel(PayrollRun $run): string
    {
        $run->loadMissing(['items.employee.department']);

        $rows = [
            ['Employee Number', 'Employee Name', 'Department', 'Currency', 'Basic Salary', 'Allowance', 'Overtime Minutes', 'Overtime Amount', 'Bonus', 'THR', 'Deduction', 'Tax', 'BPJS', 'Gross', 'Net'],
        ];

        foreach ($run->items as $item) {
            $rows[] = [
                $item->employee?->employee_number ?? '',
                $item->employee?->full_name ?? '',
                $item->employee?->department?->name ?? '',
                $item->currency,
                (string) $item->basic_salary,
                (string) $item->allowance_amount,
                (string) $item->overtime_minutes,
                (string) $item->overtime_amount,
                (string) $item->bonus_amount,
                (string) $item->thr_amount,
                (string) $item->deduction_amount,
                (string) $item->tax_amount,
                (string) $item->bpjs_amount,
                (string) $item->gross_amount,
                (string) $item->net_amount,
            ];
        }

        $xmlRows = array_map(function (array $row): string {
            $cells = array_map(function (string $cell): string {
                return '<Cell><Data ss:Type="String">'.$this->xml($cell).'</Data></Cell>';
            }, $row);

            return '<Row>'.implode('', $cells).'</Row>';
        }, $rows);

        return '<?xml version="1.0"?>'
            .'<?mso-application progid="Excel.Sheet"?>'
            .'<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"'
            .' xmlns:o="urn:schemas-microsoft-com:office:office"'
            .' xmlns:x="urn:schemas-microsoft-com:office:excel"'
            .' xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">'
            .'<Worksheet ss:Name="Payroll '.$this->xml($run->payroll_month).'"><Table>'
            .implode('', $xmlRows)
            .'</Table></Worksheet></Workbook>';
    }

    /**
     * @param  array<int, string>  $lines
     */
    private function buildPdf(array $lines): string
    {
        $contentLines = [
            'BT',
            '/F1 12 Tf',
            '50 800 Td',
        ];

        foreach ($lines as $index => $line) {
            if ($index === 0) {
                $contentLines[] = '(' . $this->pdfEscape($line) . ') Tj';

                continue;
            }

            $contentLines[] = '0 -18 Td';
            $contentLines[] = '(' . $this->pdfEscape($line) . ') Tj';
        }

        $contentLines[] = 'ET';
        $stream = implode("\n", $contentLines);

        $objects = [
            '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj',
            '2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj',
            '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj',
            '4 0 obj << /Length '.strlen($stream).' >> stream'."\n".$stream."\n".'endstream endobj',
            '5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj',
        ];

        $pdf = "%PDF-1.4\n";
        $offsets = [0];

        foreach ($objects as $object) {
            $offsets[] = strlen($pdf);
            $pdf .= $object."\n";
        }

        $xrefPosition = strlen($pdf);
        $pdf .= 'xref'."\n";
        $pdf .= '0 '.(count($objects) + 1)."\n";
        $pdf .= "0000000000 65535 f \n";

        for ($index = 1; $index <= count($objects); $index++) {
            $pdf .= str_pad((string) $offsets[$index], 10, '0', STR_PAD_LEFT)." 00000 n \n";
        }

        $pdf .= 'trailer << /Size '.(count($objects) + 1).' /Root 1 0 R >>'."\n";
        $pdf .= 'startxref'."\n";
        $pdf .= $xrefPosition."\n";
        $pdf .= '%%EOF';

        return $pdf;
    }

    private function pdfEscape(?string $text): string
    {
        $value = $this->pdfText($text ?? '');

        return str_replace(
            ['\\', '(', ')'],
            ['\\\\', '\\(', '\\)'],
            $value,
        );
    }

    private function pdfText(string $text): string
    {
        $converted = iconv('UTF-8', 'windows-1252//TRANSLIT//IGNORE', $text);

        return $converted === false ? $text : $converted;
    }

    private function xml(string $value): string
    {
        return htmlspecialchars($value, ENT_QUOTES | ENT_XML1);
    }

    private function money(string|float|int $amount, string $currency): string
    {
        return $currency.' '.number_format((float) $amount, 2, '.', ',');
    }
}
