#!/bin/bash

VER=$(sed -ne "s/ *\"version\": ['\"]\([^'\"]*\)['\"] *,/\1/p" manifest.json)
FILENAME=autopintab-$VER.zip
ZIP=`which zip 2> /dev/null`
if [ ! -x "$ZIP" ]; then
    echo "zip command is missing, aborting!"
    exit 1
fi;

# delete existing file
rm -f $FILENAME

# create new
$ZIP $FILENAME \
  manifest.json \
  README.md     \
  background/*  \
  icons/*       \
  js/*          \
  options/*

# completed
echo
echo "ZIP file" $FILENAME "created"
