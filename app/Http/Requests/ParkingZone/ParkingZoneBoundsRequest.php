<?php

namespace App\Http\Requests\ParkingZone;

use Illuminate\Foundation\Http\FormRequest;

class ParkingZoneBoundsRequest extends FormRequest
{
    private const MAX_LAT_DELTA = 0.2;

    private const MAX_LNG_DELTA = 0.2;

    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $centerLat = $this->input('latitude');
        $centerLng = $this->input('longitude');
        $latDelta = $this->input('latitudeDelta', 0);
        $lngDelta = $this->input('longitudeDelta', 0);
        
        $latDelta = min($latDelta, self::MAX_LAT_DELTA);
        $lngDelta = min($lngDelta, self::MAX_LNG_DELTA);
        
        $this->merge([
            'min_lat' => $centerLat - ($latDelta / 2),
            'max_lat' => $centerLat + ($latDelta / 2),
            'min_lng' => $centerLng - ($lngDelta / 2),
            'max_lng' => $centerLng + ($lngDelta / 2),
        ]);
    }

    public function rules(): array
    {
        return [
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'latitudeDelta' => 'required|numeric|min:0',
            'longitudeDelta' => 'required|numeric|min:0',
            'min_lat' => 'sometimes|numeric',
            'max_lat' => 'sometimes|numeric',
            'min_lng' => 'sometimes|numeric',
            'max_lng' => 'sometimes|numeric',
        ];
    }
}
