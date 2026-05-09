<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>ComfortParking Logic APIs</title>
  
  <!-- Swagger UI CSS -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui.css" />
  <link rel="shortcut icon" href="https://fastly.jsdelivr.net/npm/swagger-ui-dist@5.11.0/favicon-32x32.png" />
  
  <style>
    body {
      margin: 0;
      padding: 0;
      color: #f8fafc;
      font-family: ui-sans-serif, system-ui, sans-serif;
    }
    
    /* Optional wrapper styles for full width */
    #swagger-ui {
      background: white;
      min-height: 100vh;
      border-radius: 8px;
    }

    .docs-header {
      background: #0f172a;
      padding: 1rem;
      border-bottom: 1px solid #1e293b;
    }
    .back-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      color: #94a3b8;
      text-decoration: none;
      font-size: 0.875rem;
      transition: color 0.2s;
    }
    .back-btn:hover {
      color: #f8fafc;
    }
    
    /* Hide Swagger Topbar */
    .swagger-ui .topbar {
      display: none !important;
    }
  </style>
</head>
<body>
  
  <div class="docs-header">
    <a href="/" class="back-btn">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
      Back to Home
    </a>
  </div>

  <div id="swagger-ui"></div>
  
  <!-- Swagger UI Bundle JS -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-bundle.js" crossorigin="anonymous"></script>
  <!-- Swagger UI Standalone Preset JS -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-standalone-preset.js" crossorigin="anonymous"></script>

  <script>
    window.onload = function() {
      // Build a system
      const ui = SwaggerUIBundle({
        url: "/api-docs.yaml",
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "BaseLayout",
        supportedSubmitMethods: [], // read-only docs essentially or they can test it? Keep it empty since hashes are private
        defaultModelsExpandDepth: -1 // hide models section easily
      });
      window.ui = ui;
    };
  </script>
</body>
</html>