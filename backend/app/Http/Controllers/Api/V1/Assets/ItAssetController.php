<?php

namespace App\Http\Controllers\Api\V1\Assets;

use App\Http\Controllers\Controller;
use App\Http\Requests\Assets\AssignItAssetRequest;
use App\Http\Requests\Assets\ReturnItAssetAssignmentRequest;
use App\Http\Requests\Assets\StoreItAssetMaintenanceRequest;
use App\Http\Requests\Assets\StoreItAssetRequest;
use App\Http\Resources\Assets\ItAssetAssignmentResource;
use App\Http\Resources\Assets\ItAssetMaintenanceResource;
use App\Http\Resources\Assets\ItAssetResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Assets\Application\Services\ItAssetService;
use Modules\Assets\Infrastructure\Persistence\Models\ItAsset;
use Modules\Assets\Infrastructure\Persistence\Models\ItAssetAssignment;
use Shared\Application\Support\ApiResponse;
use Shared\Application\Support\ListQueryOptions;

class ItAssetController extends Controller
{
    public function __construct(
        private readonly ItAssetService $assets,
    ) {
    }

    public function overview(Request $request): JsonResponse
    {
        $overview = $this->assets->overview($request->user('api'));

        return ApiResponse::success([
            'current_date' => $overview['current_date'],
            'stats' => $overview['stats'],
            'category_distribution' => $overview['category_distribution'],
            'status_distribution' => $overview['status_distribution'],
            'warranty_watch' => ItAssetResource::collection($overview['warranty_watch'])->resolve(),
            'maintenance_queue' => ItAssetMaintenanceResource::collection($overview['maintenance_queue'])->resolve(),
        ]);
    }

    public function lookups(Request $request): JsonResponse
    {
        return ApiResponse::success($this->assets->lookups($request->user('api')));
    }

    public function index(Request $request): JsonResponse
    {
        $query = ListQueryOptions::fromRequest(
            $request,
            allowedFilters: ['category', 'status', 'employee_id', 'branch_id'],
            allowedSorts: ['default', 'asset_code', 'category', 'status', 'purchase_date', 'warranty_expires_at'],
            defaultSortBy: 'default',
        );
        $assets = $this->assets->assets($request->user('api'), $query);

        return ApiResponse::paginated(
            $assets,
            ItAssetResource::collection($assets->items())->resolve(),
            meta: $query->meta(),
        );
    }

    public function store(StoreItAssetRequest $request): JsonResponse
    {
        $asset = $this->assets->createAsset(
            $request->user('api'),
            $request->validated(),
        );

        return ApiResponse::success(
            new ItAssetResource($asset),
            'IT asset created successfully.',
            201,
        );
    }

    public function show(Request $request, ItAsset $asset): JsonResponse
    {
        return ApiResponse::success(
            new ItAssetResource($this->assets->showAsset($request->user('api'), $asset)),
        );
    }

    public function assign(AssignItAssetRequest $request, ItAsset $asset): JsonResponse
    {
        $assignment = $this->assets->assignAsset(
            $asset,
            $request->user('api'),
            $request->validated(),
        );

        return ApiResponse::success(
            new ItAssetAssignmentResource($assignment),
            'Asset assigned successfully.',
            201,
        );
    }

    public function return(ReturnItAssetAssignmentRequest $request, ItAssetAssignment $assignment): JsonResponse
    {
        $returnedAssignment = $this->assets->returnAsset(
            $assignment,
            $request->user('api'),
            $request->validated(),
        );

        return ApiResponse::success(
            new ItAssetAssignmentResource($returnedAssignment),
            'Asset returned successfully.',
        );
    }

    public function storeMaintenance(StoreItAssetMaintenanceRequest $request, ItAsset $asset): JsonResponse
    {
        $maintenance = $this->assets->logMaintenance(
            $asset,
            $request->user('api'),
            $request->validated(),
        );

        return ApiResponse::success(
            new ItAssetMaintenanceResource($maintenance),
            'Asset maintenance logged successfully.',
            201,
        );
    }
}
