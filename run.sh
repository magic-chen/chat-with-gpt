#!/bin/bash

# 获取 Git 提交的前7位作为 tag
GIT_COMMIT_HASH=$(git rev-parse --short HEAD)

export GIT_COMMIT_HASH

podman-compose up -d