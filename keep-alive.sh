#!/bin/bash
while true; do
  npx next dev -p 3000 2>&1 | tee -a /home/z/my-project/dev.log
  echo "[watchdog] Server exited, restarting in 1s..." >> /home/z/my-project/dev.log
  sleep 1
done