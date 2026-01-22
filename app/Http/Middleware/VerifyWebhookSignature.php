<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class VerifyWebhookSignature
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $headerName = config('services.image_recognition.signature_header', 'X-Signature');
        $signature = $request->header($headerName);
        
        if (!$signature) {
            return response()->json([
                'error' => 'Missing signature'
            ], 401);
        }

        $secret = config('services.image_recognition.webhook_secret');
        $payload = $request->getContent();
        $expectedSignature = hash_hmac('sha256', $payload, $secret);

        if (!hash_equals($expectedSignature, $signature)) {
            return response()->json([
                'error' => 'Invalid signature'
            ], 401);
        }

        return $next($request);
    }
}
