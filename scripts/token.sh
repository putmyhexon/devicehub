#!/bin/bash
respJwt=$(curl --location 'devicehub:7100/auth/api/v1/mock' \
--header 'Content-Type: application/json' \
--data-raw '{
"name": "administrator",
"email": "administrator@fakedomain.com"
}')
echo "respJwt=$respJwt"
jwt=$(echo "$respJwt" | jq '.jwt' -r )
echo "jwt=$jwt"
respToken=$(curl -X POST 'devicehub:7100/api/v1/user/accessTokens?title="tokenTitle"' -H "Authorization: Bearer ${jwt}")
echo "respToken=$respToken"
token=$(echo "$respToken" | jq '.token' -r )
echo "token=$token"
if [ -n "$token" ]; then
  echo "Using token = $token"
else
  echo "Token is empty"
  echo "##teamcity[buildStop comment='There is no token for API tests' readdToQueue='false']"
  exit 1
fi
export STF_TOKEN=$token
