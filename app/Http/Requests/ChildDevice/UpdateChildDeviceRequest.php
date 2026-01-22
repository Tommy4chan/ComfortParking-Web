<?php

namespace App\Http\Requests\ChildDevice;

use Illuminate\Foundation\Http\FormRequest;

class UpdateChildDeviceRequest extends FormRequest
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
            'parking_spot_id' => 'nullable|exists:parking_spots,id',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        if ($this->parking_spot_id === 'none') {
            $this->merge([
                'parking_spot_id' => null,
            ]);
        }
    }
}
