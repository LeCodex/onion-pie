#/bin/sh

# Fetch the newest code
git fetch origin master

# Hard reset
git reset --hard origin/master

# Force pull
git pull origin master --force

# Build the react site
npm run build
