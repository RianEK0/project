<?php

namespace Tests\Unit\Shared;

use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Shared\Application\DTO\DataTransferObject;
use Shared\Application\Support\ApiResponse;
use Shared\Application\Support\CollectionPaginator;
use Shared\Application\Support\CollectionQuery;
use Shared\Application\Support\ListQueryOptions;
use Tests\TestCase;

final readonly class DummyDataTransferObject extends DataTransferObject
{
    public function __construct(
        public string $name,
        public int $count,
        public ?string $note,
    ) {
    }
}

class SupportUtilitiesTest extends TestCase
{
    public function test_data_transfer_object_returns_public_properties_as_array(): void
    {
        $dto = new DummyDataTransferObject('HRIS', 3, null);

        $this->assertSame([
            'name' => 'HRIS',
            'count' => 3,
            'note' => null,
        ], $dto->toArray());
    }

    public function test_list_query_options_from_request_normalizes_filters_sort_and_pagination(): void
    {
        $request = Request::create('/api/v1/employees', 'GET', [
            'page' => '0',
            'per_page' => '999',
            'search' => '  Nadia Putri  ',
            'sort_by' => 'full_name',
            'sort_direction' => 'desc',
            'employment_status' => 'active',
            'department_id' => '5',
        ]);

        $query = ListQueryOptions::fromRequest(
            $request,
            allowedFilters: ['employment_status', 'department_id'],
            allowedSorts: ['default', 'full_name'],
            defaultSortBy: 'default',
            defaultSortDirection: 'asc',
            defaultPerPage: 15,
            maxPerPage: 50,
        );

        $this->assertSame(1, $query->page);
        $this->assertSame(50, $query->perPage);
        $this->assertSame('Nadia Putri', $query->search);
        $this->assertSame('full_name', $query->sortBy);
        $this->assertSame('desc', $query->sortDirection);
        $this->assertSame('active', $query->filter('employment_status'));
        $this->assertSame('5', $query->filter('department_id'));
        $this->assertNull($query->filter('branch_id'));
    }

    public function test_list_query_options_meta_uses_defaults_and_excludes_empty_filters(): void
    {
        $request = Request::create('/api/v1/teams', 'GET', [
            'per_page' => '-10',
            'search' => '   ',
            'sort_by' => 'unknown',
            'sort_direction' => 'sideways',
            'department_id' => '',
            'lead_employee_id' => '17',
        ]);

        $query = ListQueryOptions::fromRequest(
            $request,
            allowedFilters: ['department_id', 'lead_employee_id'],
            allowedSorts: ['default', 'name'],
            defaultSortDirection: 'desc',
            defaultPerPage: 25,
            maxPerPage: 100,
        );

        $this->assertSame(1, $query->page);
        $this->assertSame(1, $query->perPage);
        $this->assertNull($query->search);
        $this->assertSame('default', $query->sortBy);
        $this->assertSame('desc', $query->sortDirection);
        $this->assertSame([
            'search' => null,
            'sort' => [
                'by' => 'default',
                'direction' => 'desc',
            ],
            'filters' => [
                'lead_employee_id' => '17',
            ],
        ], $query->meta());
    }

    public function test_collection_query_search_and_sort_support_scalar_and_array_resolvers(): void
    {
        $items = new Collection([
            (object) ['name' => 'Nadia Putri', 'skills' => ['People Ops', 'Payroll'], 'score' => 82],
            (object) ['name' => 'Alya Pratama', 'skills' => ['Leadership', 'Recruitment'], 'score' => 91],
            (object) ['name' => 'Rafi Saputra', 'skills' => ['Analytics', 'Compliance'], 'score' => 88],
        ]);

        $filtered = CollectionQuery::search($items, 'payroll', static fn (object $item): array => [
            $item->name,
            ...$item->skills,
        ]);

        $this->assertCount(1, $filtered);
        $this->assertSame('Nadia Putri', $filtered->first()->name);

        $sorted = CollectionQuery::sort(
            $items,
            new ListQueryOptions(
                page: 1,
                perPage: 15,
                search: null,
                sortBy: 'score',
                sortDirection: 'desc',
            ),
            static fn (object $item, string $sortBy): mixed => $item->{$sortBy},
        );

        $this->assertSame(['Alya Pratama', 'Rafi Saputra', 'Nadia Putri'], $sorted->pluck('name')->all());
    }

    public function test_collection_paginator_slices_collection_and_preserves_total_count(): void
    {
        $paginator = CollectionPaginator::paginate(
            collect([10, 20, 30, 40, 50]),
            new ListQueryOptions(
                page: 2,
                perPage: 2,
                search: null,
                sortBy: 'default',
                sortDirection: 'asc',
            ),
        );

        $this->assertSame([30, 40], $paginator->items());
        $this->assertSame(5, $paginator->total());
        $this->assertSame(2, $paginator->currentPage());
        $this->assertSame(3, $paginator->lastPage());
    }

    public function test_api_response_success_and_paginated_build_expected_json_payloads(): void
    {
        $successResponse = ApiResponse::success(
            data: ['ok' => true],
            message: 'Saved successfully.',
            status: 201,
            meta: ['trace_id' => 'abc-123'],
        );

        $this->assertSame(201, $successResponse->getStatusCode());
        $this->assertSame([
            'message' => 'Saved successfully.',
            'data' => ['ok' => true],
            'meta' => ['trace_id' => 'abc-123'],
        ], $successResponse->getData(true));

        $paginator = new LengthAwarePaginator(
            items: collect([['id' => 7]]),
            total: 3,
            perPage: 1,
            currentPage: 2,
            options: ['path' => '/api/v1/example'],
        );

        $paginatedResponse = ApiResponse::paginated(
            $paginator,
            [['id' => 7]],
            meta: ['filters' => ['status' => 'active']],
        );

        $payload = $paginatedResponse->getData(true);

        $this->assertSame('Request completed successfully.', $payload['message']);
        $this->assertSame([['id' => 7]], $payload['data']);
        $this->assertSame(2, $payload['meta']['current_page']);
        $this->assertSame(3, $payload['meta']['last_page']);
        $this->assertSame(1, $payload['meta']['per_page']);
        $this->assertSame(3, $payload['meta']['total']);
        $this->assertSame(2, $payload['meta']['from']);
        $this->assertSame(2, $payload['meta']['to']);
        $this->assertSame(['status' => 'active'], $payload['meta']['filters']);
    }
}
