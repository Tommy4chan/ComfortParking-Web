<?php

namespace App\Http\Requests\Device;

use Illuminate\Foundation\Http\FormRequest;

class SyncSpotsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'hash' => 'required|string|size:32|exists:devices,hash',
            'battery_voltage' => 'required|integer|min:0|max:65535',
            'used_parking_spots' => 'required|integer|min:0',
        ];
    }
}
