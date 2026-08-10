#!/bin/sh
# 원본 data/*.json → godot/data/ 동기화 (데이터가 바뀔 때마다)
cp ../data/*.json data/ && node ../tools/gen_golden.mjs && echo "동기화 + 골든 재생성 완료"
