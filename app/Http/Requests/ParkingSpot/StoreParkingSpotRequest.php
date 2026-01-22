<?php

namespace App\Http\Requests\ParkingSpot;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreParkingSpotRequest extends FormRequest
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
            'device_id' => 'required|exists:devices,id',
            'index' => [
                'required',
                'integer',
                'min:0',
                Rule::unique('parking_spots', 'index')
                    ->where('device_id', $this->device_id),
            ],
            'point_1_x' => 'required|numeric',
            'point_1_y' => 'required|numeric',
            'point_2_x' => 'required|numeric',
            'point_2_y' => 'required|numeric',
            'point_3_x' => 'required|numeric',
            'point_3_y' => 'required|numeric',
            'point_4_x' => 'required|numeric',
            'point_4_y' => 'required|numeric',
        ];
    }

    /**
     * Get custom validation messages.
     */
    public function messages(): array
    {
        return [
            'index.unique' => 'This index already exists for this device. Please choose a different index.',
        ];
    }
}
