STARTSCRIPT="run.js"

echo "Deploying Wealdstone..."
sudo pkill -f $STARTSCRIPT
sudo node $STARTSCRIPT &