# Adding an iOS device to DeviceHub

Use ios-provider unit to add a provider that will track and manage port forwarding to the device.

Also see [lib/cli/ios-device/run-wda.sh](../../lib/cli/ios-device/run-wda.sh) on how to run a single device.
This script is designed to set up and run WebDriverAgent on an iOS device using `idb` and `pymobiledevice3`. It also sets up port forwarding that is needed for the ios-device.

## Requirements

-   Installed `git`
-   Installed `idb`
-   Installed `xcodebuild`
-   Installed the `stf` command from this repository (clone this repository and do `npm ci` followed by `npm link`)
-   Access to MongoDB which used by stf
    Note: You need to create you own provisioning profile in XCode for the [WebDriverAgent project](../../WebDriverAgent)

## Usage

First start [WebDriverAgent](./../WebDriverAgent/)
Then run

```bash
stf ios-provider \
    --connect-sub tcp://127.0.0.1:7114 \
    --connect-push tcp://127.0.0.1:7116 \
    --connect-app-dealer tcp://127.0.0.1:7112 \
    --connect-dev-dealer tcp://127.0.0.1:7115 \
    --screen-ws-url-pattern 'ws://localhost:<%= publicPort %>' \
    --public-ip localhost \
    --provider localworker \
    --storage-url http://localhost:7100/
```
Also you can use ESP32 Implementation described in [this document](esp32.md)

## Determine the device name:

The device name is determined using idb list-targets.

## Port forwarding:

A [fork](https://github.com/irdkwmnsb/node-usbmux) of node-usbmux is used to forward ports 9100 and 8100 from the device to the local machine.


1. Install idb from scratch
   Install python from here https://www.python.org/downloads/
   Install pip like that python3 -m ensurepip --upgrade https://pip.pypa.io/en/stable/installation/
   Install idb like that pip3 install fb-idb https://fbidb.io/docs/installation/
2. Install xcode from appstore
3. Install stf on computer
   clone repo https://github.com/VKCOM/devicehub
   install nvm first brew install nvm
   mkdir ~/.nvm

   export NVM_DIR="$HOME/.nvm"
   [ -s "/opt/homebrew/opt/nvm/nvm.sh" ] && \. "/opt/homebrew/opt/nvm/nvm.sh"  # This loads nvm
   [ -s "/opt/homebrew/opt/nvm/etc/bash_completion.d/nvm" ] && \. "/opt/homebrew/opt/nvm/etc/bash_completion.d/nvm"  # This loads nvm bash_completion
   npm link
   npm ci
4. Run ios provider
```bash
stf ios-provider \
    --connect-sub tcp://192.168.0.102:7150 \
    --connect-push tcp://192.168.0.102:7170 \
    --connect-app-dealer tcp://192.168.0.102:7160 \
    --connect-dev-dealer tcp://192.168.0.102:7260 \
    --screen-ws-url-pattern 'wss://devicehub.putmyhexon.ru:<%= publicPort %>' \
    --public-ip devicehub.putmyhexon.ru \
    --provider ios-provider \
    --storage-url https://devicehub.putmyhexon.ru/
```
```bash
stf ios-provider \
    --connect-sub tcp://192.168.0.102:7250 \
    --connect-push tcp://192.168.0.102:7270 \
    --connect-app-dealer tcp://192.168.0.102:7160 \
    --connect-dev-dealer tcp://192.168.0.102:7260 \
    --screen-ws-url-pattern "wss://devicehub.putmyhexon.ru:443/d/ios-provider-1/<%= publicPort %>/" \
    --public-ip devicehub.putmyhexon.ru \
    --provider ios-provider-1 \
    --storage-url https://devicehub.putmyhexon.ru:443/ \
    --secret nosecret \
    --no-cleanup
```


stf ios-provider \
--connect-sub tcp://192.168.0.102:7250 \
--connect-push tcp://192.168.0.102:7270 \
--connect-app-dealer tcp://192.168.0.102:7160 \
--connect-dev-dealer tcp://192.168.0.102:7260 \
--screen-ws-url-pattern "wss://devicehub.putmyhexon.ru:443/d/ios-provider-2/<%= publicPort %>/" \
--public-ip devicehub.putmyhexon.ru \
--provider ios-provider-2 \
--storage-url https://devicehub.putmyhexon.ru:443/ \
--secret nosecret \
--no-cleanup

add to zhsrc
export MONGODB_PORT_27017_TCP="mongodb://192.168.0.102:27017/database?replicaSet=devicehub-rs&directConnection=true"
export SECRET="nosecret"