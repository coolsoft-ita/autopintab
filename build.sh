#!/bin/bash

VER=$(sed -ne "s/ *\"version\": ['\"]\([^'\"]*\)['\"] *,/\1/p" manifest.json)
FILENAME=autopintab-$VER.zip

# delete existing file
rm -f $FILENAME

# create new
zip $FILENAME \
  manifest.json \
  README.md     \
  background/*  \
  icons/*       \
  js/*          \
  options/*

# completed
echo
echo "ZIP file" $FILENAME "created"
