#!/usr/bin/env bash
# 生产启动
set -e
cd "$(dirname "$0")/.."
exec node dist/server/main.js
