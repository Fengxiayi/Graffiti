#!/usr/bin/env bash
# 生产构建：先构建后端，再构建前端
set -e
cd "$(dirname "$0")/.."

echo "==> 构建后端 (NestJS)"
npm run build:server

echo "==> 构建前端 (Vite)"
npm run build:client

echo "==> 构建完成，启动命令：npm start（node dist/server/main.js）"
