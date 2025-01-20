#!/bin/bash
apk --no-cache add curl
respJwt=$(curl --location 'devicehub:7100/auth/api/v1/mock' \
--header 'Content-Type: application/json' \
--data-raw '{
"name": "administrator",
"email": "administrator@fakedomain.com"
}')
echo "respJwt=$respJwt"
jwt=$(echo "$respJwt" | grep -o 'jwt=.*\"' | sed 's/jwt=//; s/"//;')
#echo "jwt=$jwt"
respToken=$(curl -X POST 'devicehub:7100/api/v1/user/accessTokens?title="tokenTitle"' -H "Cookie:token=\"${jwt}\"")
echo "respToken=$respToken"
token=$(echo "$respToken" | grep -o 'token".*\"' | sed 's/token":"//; s/"//;')
#echo "token=$token"
if [ -n "$token" ]; then
  echo "Token has gotten $token"
else
  echo "Token is empty"
  echo "##teamcity[buildStop comment='There is no token for API tests' readdToQueue='false']"
fi
export STF_TOKEN=$token
