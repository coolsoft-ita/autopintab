#!/bin/bash

rm -f autopintab.zip

zip autopintab.zip \
  manifest.json \
  README.md     \
  background/*  \
  icons/*       \
  js/*          \
  options/*
