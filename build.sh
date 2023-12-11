#!/bin/bash
docker build --build-arg GIT_COMMIT=$(git rev-parse HEAD) -t chat-with-gpt-frontend:$(git rev-parse --short=7 HEAD) .
