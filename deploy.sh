#!/bin/bash

# Stop execution if any command fails
set -e

echo "=> Changing directory to /DATA/AppData/analparking.top..."
cd /DATA/AppData/analparking.top || { echo "Directory not found!"; exit 1; }

echo "=> Rebuilding and starting docker containers..."
sudo docker compose up -d --build

echo "=> Restarting background queue and scheduler services..."
sudo docker compose restart queue scheduler

echo "=> Deployment completed successfully!"
