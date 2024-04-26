# Deployment using Docker Compose

This deployment method sets up DeviceHub along with MongoDB cluster in Docker containers.

## Step by Step

First, ensure that Docker is installed on your system. Then, proceed with the following steps:

1. Clone the repository and adjust the compose file according to your settings.

   Here's an example command used for local debugging:

   ```yaml
   command: stf local --adb-host adb --public-ip 0.0.0.0 --provider-min-port 7400 --provider-max-port 7500
   ```

   We highly recommend setting secret options and using a real authentication provider instead of `auth-mock`. You can find the options for `stf local` [here](units.md/#local).

2. After adjusting the options, run the following command:

   ```bash
   docker-compose -f docker-compose.yaml up -d --build
   ```

   This command builds the images and launches DeviceHub with the selected `--public-ip`.
