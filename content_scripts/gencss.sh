#!/bin/sh

a=$(echo "cssVal: \"`cat main.css`\"" | tr "\n" "|" | sed 's/|/\\n/g' | sed 's/\(\\n\)\+$//g')
echo $a, | xsel -b
