#!/bin/sh

if [[ ! -d distribution ]]; then mkdir distribution; fi

for i in `find . -maxdepth 1 | egrep -v "distribution|git|^\.$"`; do
  cp -r $i distribution
done
