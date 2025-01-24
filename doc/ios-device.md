# Adding an iOS device to DeviceHub

See [lib/cli/ios-device/run-wda.sh](.lib/cli/ios-device/run-wda.sh)
This script is designed to set up and run WebDriverAgent on an iOS device using `idb` and `pymobiledevice3`. It also sets up port forwarding that is needed for the ios-provider.

## Requirements

- Installed `git`
- Installed `idb`
- Installed `pymobiledevice3` (use our fork [https://github.com/irdkwmnsb/pymobiledevice3](https://github.com/irdkwmnsb/pymobiledevice3))
- Installed `xcodebuild`
- Installed the `stf` command from this repository (clone this repository and do `npm ci` followed by `npm link`)
- Access to MongoDB which used by stf
  Note: You need to create you own provisioning profile in XCode for the [WebDriverAgent project](./WebDriverAgent)
## Usage

```bash
./run-wda.sh
```
or

```bash
./run-wda.sh [deviceId] [deviceNum]
```

## Determine the device identifier:

If deviceId is not specified, the script attempts to determine the first connected iOS device using idb list-targets.

## Determine the device name:

The device name is determined using idb list-targets.

## Port forwarding:

pymobiledevice3 is used to forward ports 9100 and 8100 (or their variations depending on deviceNum) to the device.
