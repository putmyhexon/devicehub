#!/bin/bash
# Example to run WDA with pymobiledevice3

echo "This script is a mere example. Please do not run it without modifications"
read -p "Press enter to continue"

set -o pipefail

cd "$(git rev-parse --show-toplevel)" || exit


if [ -n "$1" ]; then
  deviceId=$1
else
  deviceId=$(idb list-targets | grep "device" | awk -F '|' '{ gsub(/ /, "", $0); print $2 }' | head -1)
fi

trap exit EXIT

deviceName=$(idb list-targets | grep "$deviceId" | awk -F '|' '{ gsub(/ $/, "", $0); print $1 }' | head -1)
echo "Using device $deviceId ($deviceName)"  >&2
pushd WebDriverAgent || exit
xcodebuild \
  -project WebDriverAgent.xcodeproj \
  -scheme WebDriverAgentRunner \
  -destination "id=$deviceId" \
  build

xcodebuild \
  -project WebDriverAgent.xcodeproj \
  -scheme WebDriverAgentRunner \
  -destination "id=$deviceId" \
  test  &
wdapid=$!

source /path/to/pymobiledevice3/venv
pymobiledevice3 usbmux forward 9100 9100 &
mjpegpid=$!
pymobiledevice3 usbmux forward 8100 8100 &
wdaproxypic=$!

function exit() {
  kill $wdapid
  kill $mjpegpid
  kill $wdaproxypic
  wait
}

read -p "Press enter to continue"

MONGODB_PORT_27017_TCP=mongodburl stf ios-device \
    --serial "$deviceId" \
    --device-name "$deviceName" \
    --host localhost \
    --screen-port 18000 \
    --mjpeg-port  9100 \
    --provider providerName \
    --public-ip localhost \
    --screen-ws-url-pattern "wss://accessibleurlforfrontend/ios-device/18000/" \
    --storage-url http://storageurl/ \
    --connect-sub "tcp://ip:22003" \
    --connect-push "tcp://ip:22005" \
    --connect-app-dealer tcp://ip:22001 \
    --connect-dev-dealer  tcp://ip:22004 \
    --wda-host 127.0.0.1 \
    --wda-port 8100

