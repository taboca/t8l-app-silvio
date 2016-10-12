#!/bin/bash
rm -rf /root/.forever/*.log
/etc/init.d/telasocial stop
/etc/init.d/telasocial start
git reset --hard HEAD
git pull --force
python _restart.py;
ps -efa | grep tela
