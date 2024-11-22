import random
import string

import pytest
from smartphone_test_farm_client import AuthenticatedClient

ADMIN_EMAIL = 'administrator@fakedomain.com'
ADMIN_NAME = 'administrator'
ADMIN_PRIVILEGE = 'admin'


def pytest_addoption(parser):
    parser.addoption("--token", action="store")
    parser.addoption("--base-host-name", action="store")


@pytest.fixture(scope='session')
def token(request):
    token_value = request.config.option.token
    if token_value is None:
        pytest.fail(reason='Missed token')
    return token_value


@pytest.fixture(scope='module')
def base_host(request):
    host = request.config.option.base_host_name
    if host is None:
        pytest.fail(reason='Missed base host')
    return host


@pytest.fixture(scope='module')
def base_url(request):
    url = request.config.option.base_host_name
    if url is None:
        pytest.fail(reason='Missed rul')
    return f'http://{url}/api/v1'


@pytest.fixture(scope="module")
def api_client(token, base_url):
    api_client = AuthenticatedClient(base_url=base_url,
                                     token=token)
    return api_client


@pytest.fixture(scope="module")
def api_client_with_bad_token(base_url):
    api_client = AuthenticatedClient(base_url=base_url, token='bad_token')
    return api_client


class User:
    def __init__(self, email, name, privilege):
        self.email = email
        self.name = name
        self.privilege = privilege

    def __str__(self):
        return f"User(email={self.email}, name={self.name}, privilege={self.privilege})"


@pytest.fixture(scope="module")
def admin_user():
    return User(email=ADMIN_EMAIL, name=ADMIN_NAME, privilege=ADMIN_PRIVILEGE)


@pytest.fixture(scope="module")
def random_user(random_str):
    def random_user_func():
        return User(email=f'{random_str()}@test.com', name=random_str(), privilege='user')

    return random_user_func


@pytest.fixture(scope="module")
def random_str():
    def random_str_func(size=10, chars=string.ascii_uppercase + string.ascii_lowercase + string.digits):
        return ''.join(random.choice(chars) for _ in range(size))

    return random_str_func


@pytest.fixture(scope="module")
def random_choice():
    def random_func(list):
        return random.choice(list)

    return random_func
