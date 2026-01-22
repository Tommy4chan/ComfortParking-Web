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
            'results' => 'required|array|min:1',
            'results.*.parking_spot_id' => 'required|integer|exists:parking_spots,id',
            'results.*.is_used' => 'required|boolean',
            'processed_image_base64' => 'nullable|string',
        ];
    }
}
