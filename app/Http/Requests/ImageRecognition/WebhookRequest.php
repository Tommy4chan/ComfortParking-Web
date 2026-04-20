<?php

namespace App\Http\Requests\ImageRecognition;

use Illuminate\Foundation\Http\FormRequest;

class WebhookRequest extends FormRequest
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
            'device_id' => 'required|integer|exists:devices,id',
            'used_parking_spots' => 'required|integer|min:0',
            'processed_image_base64' => 'nullable|string',
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'device_id.required' => 'Device ID is required.',
            'device_id.exists' => 'The specified device does not exist.',
            'used_parking_spots.required' => 'Used parking spots count is required.',
        ];
    }
}
