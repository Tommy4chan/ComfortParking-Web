<?php

namespace App\Http\Requests\Device;

use Illuminate\Foundation\Http\FormRequest;

class StoreDeviceRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'parking_zone_id' => 'required|exists:parking_zones,id',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'zone_point_1_x' => 'nullable|integer|min:0',
            'zone_point_1_y' => 'nullable|integer|min:0',
            'zone_point_2_x' => 'nullable|integer|min:0',
            'zone_point_2_y' => 'nullable|integer|min:0',
            'zone_point_3_x' => 'nullable|integer|min:0',
            'zone_point_3_y' => 'nullable|integer|min:0',
            'zone_point_4_x' => 'nullable|integer|min:0',
            'zone_point_4_y' => 'nullable|integer|min:0',
            'parking_spots_count' => 'nullable|integer|min:1',
        ];
    }
}
