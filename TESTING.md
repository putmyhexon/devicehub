## Unit Frontend

- Install PhantomJS: `brew install phantomjs`
- Run Karma tests: `gulp karma`

## End-to-End (E2E) Frontend

### On First Run
- Update WebDriver: `gulp webdriver-update`

## Protractor & Jasmine - Local STF Tests

---
#### Preconditions
The test configuration points to the Google Chrome browser. The test works with Google Chrome version 77.0.3865.75 together with chromedriver version 77.0.3865.40.

---

- Connect a device or start an Android emulator.
- Run MongoDB:
    ```bash
    docker run --rm -d -p 27017:27017 -h 127.0.0.1 --name mongo mongo:6.0.10 --replSet=test && sleep 4 && docker exec mongo mongosh --eval "rs.initiate();"
    ```
- Run STF:
    ```bash
    ./bin/stf local
    ```
  Wait until STF is fully functional and devices are discovered.
- Run tests:
    ```bash
    gulp protractor
    ```

---
#### Info
Test results can be found at:
test-results/reports-protractor/dashboardReport-protractor/index.html

---

## Multiple Browsers Local STF with a Specific Suite

- Connect a device.
- Run STF.
- Run Protractor with multiple browsers and a specific suite:
    ```bash
    gulp protractor --multi --suite devices
    ```

## Chrome Remote STF

- Set environment variables:
    ```bash
    export STF_URL='http://stf-url/#!/'
    export STF_USERNAME='user'
    export STF_PASSWORD='pass'
    ```
- Run Protractor tests:
    ```bash
    gulp protractor
    ```
