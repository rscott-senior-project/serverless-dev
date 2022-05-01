#!/bin/bash

KEY=$1
NAME=$2

curl https://nltlfq9zc0.execute-api.us-east-1.amazonaws.com/addItem  -X POST -H 'Content-Type: application/json' -d '{"itemKey": "'"$KEY"'", "name": "'"$NAME"'"}' 
