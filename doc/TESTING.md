## API Tests

### Run in docker
Just run
`docker compose -f docker-compose-test.yaml --env-file scripts/variables.env up -exit-code-from devicehub-pytest --abort-on-container-exit devicehub-pytest --remove-orphans` and check devicehub-test output

### Local run
- First of all you need running instance of DeviceHub
- Open test/api directory and run `poetry install` (We highly recommend create python venv first)
- Then you can run tests by command `pytest ./ --token=<stf token here> --base-url=<link to already running devicehub> --log-cli-level=DEBUG`
