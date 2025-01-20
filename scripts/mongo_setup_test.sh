#!/bin/bash
sleep 10

mongosh --host mongo1:27017 <<EOF
  rs.initiate();
EOF
