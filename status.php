<!DOCTYPE html>
<html lang="fr">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Status - Copy Trading Bot</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Public+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Public Sans', sans-serif;
        }
    </style>
</head>

<body class="bg-slate-900 text-white">
    <div class="container mx-auto px-4 py-8">
        <h1 class="text-3xl font-bold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
            📊 Status - Copy Trading Bot
        </h1>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <?php
            // Test de la base de données
            try {
                require_once __DIR__ . '/api/config/database.php';
                $db = Database::getInstance();
                $pdo = $db->getConnection();
                $dbStatus = "✅ Connecté";
                $dbClass = "bg-green-500/20 border-green-500/50";
            } catch (Exception $e) {
                $dbStatus = "❌ Erreur: " . $e->getMessage();
                $dbClass = "bg-red-500/20 border-red-500/50";
            }

            // Test des permissions de fichiers
            $writableDir = is_writable(__DIR__);
            $permStatus = $writableDir ? "✅ OK" : "❌ Problème permissions";
            $permClass = $writableDir ? "bg-green-500/20 border-green-500/50" : "bg-red-500/20 border-red-500/50";

            // Extensions PHP requises
            $requiredExtensions = ['pdo', 'pdo_mysql', 'json', 'curl'];
            $extensionsOK = true;
            $extensionsStatus = [];

            foreach ($requiredExtensions as $ext) {
                $loaded = extension_loaded($ext);
                $extensionsStatus[$ext] = $loaded;
                if (!$loaded) $extensionsOK = false;
            }

            $extStatus = $extensionsOK ? "✅ Toutes charges" : "❌ Extensions manquantes";
            $extClass = $extensionsOK ? "bg-green-500/20 border-green-500/50" : "bg-red-500/20 border-red-500/50";
            ?>

            <!-- Status DB -->
            <div class="<?php echo $dbClass; ?> border rounded-lg p-6">
                <h3 class="text-lg font-semibold mb-2">🗄️ Base de données</h3>
                <p><?php echo $dbStatus; ?></p>
            </div>

            <!-- Status Permissions -->
            <div class="<?php echo $permClass; ?> border rounded-lg p-6">
                <h3 class="text-lg font-semibold mb-2">📁 Permissions</h3>
                <p><?php echo $permStatus; ?></p>
            </div>

            <!-- Status Extensions -->
            <div class="<?php echo $extClass; ?> border rounded-lg p-6">
                <h3 class="text-lg font-semibold mb-2">🔧 Extensions PHP</h3>
                <p><?php echo $extStatus; ?></p>
                <div class="mt-2 text-sm">
                    <?php foreach ($extensionsStatus as $ext => $loaded): ?>
                        <div><?php echo $loaded ? '✅' : '❌'; ?> <?php echo $ext; ?></div>
                    <?php endforeach; ?>
                </div>
            </div>
        </div>

        <!-- Informations système -->
        <div class="bg-slate-800 rounded-lg p-6 mb-8">
            <h3 class="text-xl font-semibold mb-4">🖥️ Informations système</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                    <strong>PHP Version:</strong> <?php echo PHP_VERSION; ?>
                </div>
                <div>
                    <strong>Serveur:</strong> <?php echo $_SERVER['SERVER_SOFTWARE'] ?? 'Built-in'; ?>
                </div>
                <div>
                    <strong>Document Root:</strong> <?php echo $_SERVER['DOCUMENT_ROOT']; ?>
                </div>
                <div>
                    <strong>Timestamp:</strong> <?php echo date('Y-m-d H:i:s'); ?>
                </div>
            </div>
        </div>

        <!-- Liens utiles -->
        <div class="text-center space-x-4">
            <a href="/frontend/" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors">
                🎯 Frontend
            </a>
            <a href="/api/test" class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors">
                🔧 Test API
            </a>
            <a href="/phpinfo.php" class="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors">
                🐘 PHP Info
            </a>
        </div>
    </div>
</body>

</html>