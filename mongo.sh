docker run --rm -d -p 27017:27017 -h 127.0.0.1 --name mongo mongo:6.0.10 --replSet=test && sleep 4 && docker exec mongo mongosh --eval "rs.initiate();"
