#!/bin/bash

URL=$(jq .url secrets/endpoint | tr -d \")
OP=$1
KEY=$2
NAME=$3

echo $URL"/addItem"

if [ $OP == "-p" ]; then
  curl $URL"/addItem"  -X POST -H 'Content-Type: application/json' -d '{"itemKey": "'"$KEY"'", "name": "'"$NAME"'"}' 
fi

if [ $OP == "-g" ]; then
  curl $URL"/items"  -X GET -H 'Content-Type: application/json' -d '{"itemKey": "'"$KEY"'"}' 
fi

