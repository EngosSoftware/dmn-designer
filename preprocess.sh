#!/bin/bash

# clear output directory
rm -rf dist/*

project=dmn-designer

# retrieve the version and hash number from package.json
version=$(grep -E '\"version\".*:.*[^,]' package.json | tr -d \", | awk '{print $2}')
echo "Version: $version"
number=${version//\.}
echo "Hash number: $number"

# update output name in webpack.common.js
sed -i "s/'$project.*\.js'/\'$project-$number\.js'/" webpack.common.js
echo "Updated: webpack.common.js"

# update bundle name in src/index.html
sed -i "s/\"$project.*\.js\"/\"$project-$number\.js\"/" ./src/index.html
echo "Updated: src/index.html"
