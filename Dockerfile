# Use the PHP 8.4-FPM base image
FROM php:8.4-fpm

# Set working directory
WORKDIR /var/www

# --- UPDATED NODE.JS 24 (LTS) INSTALLATION ---

# 1. Install prerequisites for adding new repositories
RUN apt-get update && apt-get install -y \
    curl \
    ca-certificates \
    gnupg

# 2. Add NodeSource GPG key
RUN mkdir -p /etc/apt/keyrings
RUN curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg

# 3. Add the Node.js 24 (LTS) repository
RUN echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_24.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list

# --- END OF NODE.JS INSTALLATION ---

# Install all other system dependencies, including the new 'nodejs'
RUN apt-get update && apt-get install -y \
    git \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    libzip-dev \
    libpq-dev \
    nodejs      # This will now install Node.js v24.x

# Clear cache
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-install pdo_pgsql pgsql zip exif pcntl bcmath gd

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Configure PHP
COPY php/uploads.ini /usr/local/etc/php/conf.d/uploads.ini

# Copy application files
COPY . /var/www

# Copy the entrypoint script into the container
COPY entrypoint.sh /usr/local/bin/entrypoint.sh

# Make the script executable
RUN chmod +x /usr/local/bin/entrypoint.sh

# Expose port 9000
EXPOSE 9000

# Use the new script as the main command for this container
CMD ["/usr/local/bin/entrypoint.sh"]
