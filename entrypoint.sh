#!/bin/sh
set -e # Exit immediately if any command fails

# Set working directory
cd /var/www

# --- 1. Install Composer Dependencies ---
# THIS IS THE FIX. We must run this before any 'artisan' commands
# to create the /vendor/autoload.php file.
echo "Running composer install..."
composer install --no-interaction --no-plugins --no-scripts --prefer-dist

# --- 2. Fix .env File ---
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cp .env.example .env
fi

# --- 3. Generate APP_KEY ---
if grep -q "APP_KEY=$" .env; then
    echo "Generating APP_KEY..."
    php artisan key:generate
else
    echo "APP_KEY already set."
fi

# --- 4. Fix File Permissions ---
echo "Fixing storage/ and bootstrap/cache/ permissions..."
chown -R www-data:www-data storage bootstrap/cache

# --- 5. Install NPM Dependencies ---
echo "Running npm install..."
npm install

# --- 6. Build Frontend Assets ---
echo "Running npm run build..."
npm run build

# --- 7. Run Database Migrations ---
echo "Running database migrations..."
php artisan migrate --force

# --- 8. Create Storage Symbolic Link ---
echo "Creating storage symbolic link..."
php artisan storage:link || echo "Storage link already exists or failed (non-critical)"

# --- 9. Start the Main Service ---
echo "All setup complete. Starting php-fpm..."
exec php-fpm
