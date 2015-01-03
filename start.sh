STARTSCRIPT="run.js"
PROJECTNAME="AutocompleteAs"


echo "Deploying Wealdstone..."
sudo pkill -f $STARTSCRIPT
cd $PROJECTNAME
sudo node $STARTSCRIPT &

cd ../..