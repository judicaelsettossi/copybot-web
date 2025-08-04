<?php
namespace CopyBot\Controllers;

class ApiController 
{
    public function health(): string
    {
        return json_encode([
            'status' => 'ok',
            'message' => 'CopyBot Web API is running',
            'timestamp' => date('Y-m-d H:i:s'),
            'version' => '1.0.0'
        ]);
    }
}
