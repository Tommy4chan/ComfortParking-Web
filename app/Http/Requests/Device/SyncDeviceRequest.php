<?php

namespace App\Http\Requests\Device;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SyncDeviceRequest extends FormRequest
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
        $deviceHash = $this->input('hash');
        $deviceId = \App\Models\Device::where('hash', $deviceHash)->value('id');

        return [
            'hash' => 'required|string|size:32|exists:devices,hash',
            'battery_voltage' => 'required|integer|min:0|max:65535',
            'image' => 'nullable|image|max:10240',
            'children' => 'nullable|array',
            'children.*.hash' => [
                'required',
                'string',
                'size:32',
                Rule::exists('child_devices', 'hash')->where('device_id', $deviceId),
            ],
            'children.*.battery_voltage' => 'required|integer|min:0|max:65535',
            'children.*.is_spot_used' => 'required|boolean',
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array
     */
    public function messages(): array
    {
        return [
            'hash.required' => 'Device hash is required',
            'battery_voltage.required' => 'Battery voltage is required',
            'children.*.hash.required' => 'Child device hash is required',
            'children.*.battery_voltage.required' => 'Battery voltage is required for each child device',
            'children.*.is_spot_used.required' => 'Parking spot status is required for each child device',
        ];
    }
}
