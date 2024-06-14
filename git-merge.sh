#!/bin/bash

git checkout dev
git checkout main
git pull origin dev --no-edit
git push origin main
git checkout dev