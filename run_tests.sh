#!/bin/sh
scriptName=${0##*/}

# Merge custom features and steps if mounted
if [ -d "/opt/features" ]; then
    echo "[$scriptName] Found custom /opt/features/, merging with existing features in /usr/src/app/features/"
    cp -afv /opt/features/. /usr/src/app/features
fi

if [ -d "/opt/steps" ]; then
    echo "[$scriptName] Found custom /opt/steps/, merging with existing steps in /usr/src/app/support/"
    cp -afv /opt/steps/. /usr/src/app/features/support
    echo "[$scriptName] Contents of /usr/src/app/support after merge:"
    ls -l /usr/src/app/features/support
    echo "Contents of /usr/src/app/features/support (detailed):"
    find /usr/src/app/features/support -type f -exec ls -l {} +
fi

# Load environment variables
if [ -f "/opt/.env" ]; then
    echo "[$scriptName] Loading environment variables from /opt/.env"
    set -a
    . /opt/.env
    set +a
fi

# Copy the mounted config file to the root of the project
if [ -f "/opt/config.json" ]; then
  echo "Copying config.json to /usr/src/app/config.json"
  cp /opt/config.json /usr/src/app/config.json
fi

# Copy the mounted oas file to the root of the project
if [ -f "/opt/oas.yml" ]; then
  echo "Copying oas.yml to /usr/src/app/oas.yml"
  cp /opt/oas.yml /usr/src/app/oas.yml
fi

# Run tests with config
echo "[$scriptName] yarn cucumber-js ${@} --format progress --format json:cucumber_report.json"
eval "yarn cucumber-js ${@} --format progress --format json:cucumber_report.json"
exitCode=$?

# Run your reporting script
echo "[$scriptName] node reporting/index.js"
node reporting/index.js

# Save report to the mounted volume
cp /usr/src/app/report.html /usr/src/app/report.html

if [ $exitCode -ne 0 ]; then
    echo "[$scriptName] returning $exitCode."
    exit $exitCode
fi
