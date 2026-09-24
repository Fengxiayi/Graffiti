#!/usr/bin/env bash
# 开发模式：并行启动后端（Nest watch）与前端（Vite）
set -e
cd "$(dirname "$0")/.."

trap 'kill 0' EXIT

npm run dev:server &
npm run dev:client &

wait
