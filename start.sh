#!/bin/sh
STARTSCRIPT="run.js"

echo "Deploying Wealdstone..."
sudo kill -9 `cat wealdstone.pid`
node $STARTSCRIPT &
sudo echo $! > wealdstone.pid