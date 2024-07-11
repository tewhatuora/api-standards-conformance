#!/bin/sh
scriptName=${0##*/}

if [ -d "/opt/features" ]; then
    echo "[$scriptName] Found custom /opt/features/, merging with existing features in /usr/src/app/features/"
    cp -afv /opt/features/. /usr/src/app/features
fi

echo "[$scriptName] yarn cucumber-js ${@} --format progress --format json:cucumber_report.json"
eval "yarn cucumber-js ${@} --format progress --format json:cucumber_report.json"
exitCode=$?

echo "[$scriptName] node reporting/index.js"
node reporting/index.js

if [ $exitCode -ne 0 ]; then
    echo "[$scriptName] returning $exitCode."
    exit $exitCode
fi
