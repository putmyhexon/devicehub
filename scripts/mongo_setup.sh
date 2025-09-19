#!/bin/bash

mongosh --host 192.168.0.102:27017 <<EOF
    rs.initiate({
        _id:'devicehub-rs',
        members: [
            {
                _id:0,
                host:'192.168.0.102:27017',
                priority: 2
            }
        ]
    })
EOF
