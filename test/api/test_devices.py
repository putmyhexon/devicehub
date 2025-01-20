import pytest
from pytest_check import equal, is_not_none, is_true, is_none, is_in, is_false, greater

from smartphone_test_farm_client.api.devices import get_devices, get_device_by_serial
from smartphone_test_farm_client.models import GetDevicesTarget


# TODO: add param: GetDevicesTarget.STANDARD, when generator of devices will be ready(add device with standard group)
# api/v1/devices - list of devices
@pytest.mark.parametrize("target", [GetDevicesTarget.BOOKABLE, GetDevicesTarget.ORIGIN, GetDevicesTarget.NONE])
def test_get_devices(api_client, target, fake_device_field_check):
    if target == GetDevicesTarget.NONE:
        response = get_devices.sync_detailed(client=api_client)
    else:
        response = get_devices.sync_detailed(client=api_client, target=target)
    equal(response.status_code, 200)
    is_true(response.parsed.success)
    equal(response.parsed.description, 'Devices Information')
    is_not_none(response.parsed.devices)
    equal(len(response.parsed.devices), 5)
    for device in response.parsed.devices:
        device_dict = device.to_dict()
        fake_device_field_check(device_dict)


@pytest.mark.parametrize("target", [GetDevicesTarget.BOOKABLE, GetDevicesTarget.ORIGIN, GetDevicesTarget.NONE])
def test_get_devices_empty_fields(api_client, target, fake_device_field_check):
    if target == GetDevicesTarget.NONE:
        response = get_devices.sync_detailed(client=api_client, fields='')
    else:
        response = get_devices.sync_detailed(client=api_client, target=target, fields='')
    equal(response.status_code, 200)
    is_true(response.parsed.success)
    equal(response.parsed.description, 'Devices Information')
    is_not_none(response.parsed.devices)
    equal(len(response.parsed.devices), 5)
    for device in response.parsed.devices:
        device_dict = device.to_dict()
        fake_device_field_check(device_dict)


@pytest.mark.parametrize("target", [GetDevicesTarget.BOOKABLE, GetDevicesTarget.ORIGIN, GetDevicesTarget.NONE])
def test_get_devices_with_fields(api_client, target):
    if target == GetDevicesTarget.NONE:
        response = get_devices.sync_detailed(
            client=api_client,
            fields='present,present,status,serial,group.owner.name,using,somefields'
        )
    else:
        response = get_devices.sync_detailed(
            client=api_client,
            fields='present,present,status,serial,group.owner.name,using,somefields',
            target=target
        )
    equal(response.status_code, 200)
    is_true(response.parsed.success)
    equal(response.parsed.description, 'Devices Information')
    is_not_none(response.parsed.devices)
    equal(len(response.parsed.devices), 5)
    for device in response.parsed.devices:
        device_dict = device.to_dict()
        equal(len(device_dict.values()), 6)
        is_true(device_dict.get('present'))
        equal(device_dict.get('status'), 3)
        is_in('fake-', device_dict.get('serial'))
        equal(device_dict.get('group').get('owner').get('name'), 'administrator')
        is_false(device_dict.get('using'))
        is_not_none(device_dict.get('reverseForwards'))
        equal(device_dict.get('reverseForwards'), [])
        is_none(device_dict.get('remoteConnect'))
        is_none(device_dict.get('remoteConnectUrl'))


@pytest.mark.parametrize("target", [GetDevicesTarget.BOOKABLE, GetDevicesTarget.ORIGIN, GetDevicesTarget.NONE])
def test_get_devices_with_wrong_fields(api_client, target):
    if target == GetDevicesTarget.NONE:
        response = get_devices.sync_detailed(
            client=api_client,
            fields='wrong,,,,'
        )
    else:
        response = get_devices.sync_detailed(
            client=api_client,
            fields='wrong,,,,',
            target=target
        )
    equal(response.status_code, 200)
    is_true(response.parsed.success)
    equal(response.parsed.description, 'Devices Information')
    is_not_none(response.parsed.devices)
    equal(len(response.parsed.devices), 5)
    for device in response.parsed.devices:
        device_dict = device.to_dict()
        equal(len(device_dict.values()), 1)
        is_not_none(device_dict.get('reverseForwards'))
        equal(device_dict.get('reverseForwards'), [])


def test_get_devices_with_wrong_target(api_client):
    response = get_devices.sync_detailed(
        client=api_client,
        fields='present,',
        target=GetDevicesTarget.NONE
    )
    equal(response.status_code, 400)
    is_none(response.parsed)


# api/v1/devices/{serial} - list of devices
def test_get_device_by_serial(api_client, fake_device_field_check):
    # get first device's serial:
    response = get_devices.sync_detailed(client=api_client)
    equal(response.status_code, 200)
    is_true(response.parsed.success)
    is_not_none(response.parsed.devices)
    greater(len(response.parsed.devices), 0)
    serial = response.parsed.devices[0].serial

    response = get_device_by_serial.sync_detailed(client=api_client, serial=serial)
    equal(response.status_code, 200)
    equal(response.parsed.description, 'Device Information')
    is_true(response.parsed.success)
    is_not_none(response.parsed.device)
    device_dict = response.parsed.device.to_dict()
    fake_device_field_check(device_dict)


def test_get_device_by_serial_empty_fields(api_client, fake_device_field_check):
    # get first device's serial:
    response = get_devices.sync_detailed(client=api_client)
    equal(response.status_code, 200)
    is_true(response.parsed.success)
    is_not_none(response.parsed.devices)
    greater(len(response.parsed.devices), 0)
    serial = response.parsed.devices[0].serial

    response = get_device_by_serial.sync_detailed(client=api_client, serial=serial, fields='')
    equal(response.status_code, 200)
    equal(response.parsed.description, 'Device Information')
    is_true(response.parsed.success)
    is_not_none(response.parsed.device)
    device_dict = response.parsed.device.to_dict()
    fake_device_field_check(device_dict)


def test_get_device_by_serial_with_fields(api_client, fake_device_field_check):
    # get first device's serial:
    response = get_devices.sync_detailed(client=api_client)
    equal(response.status_code, 200)
    is_true(response.parsed.success)
    is_not_none(response.parsed.devices)
    greater(len(response.parsed.devices), 0)
    serial = response.parsed.devices[0].serial

    response = get_device_by_serial.sync_detailed(
        client=api_client,
        serial=serial,
        fields='present,present,status,serial,group.owner.name,using,somefields'
    )
    equal(response.status_code, 200)
    equal(response.parsed.description, 'Device Information')
    is_true(response.parsed.success)
    is_not_none(response.parsed.device)
    device_dict = response.parsed.device.to_dict()
    equal(len(device_dict.values()), 6)
    is_true(device_dict.get('present'))
    equal(device_dict.get('status'), 3)
    is_in('fake-', device_dict.get('serial'))
    equal(device_dict.get('group').get('owner').get('name'), 'administrator')
    is_false(device_dict.get('using'))
    is_not_none(device_dict.get('reverseForwards'))
    equal(device_dict.get('reverseForwards'), [])
    is_none(device_dict.get('remoteConnect'))
    is_none(device_dict.get('remoteConnectUrl'))


def test_get_device_by_serial_with_wrong_fields(api_client, fake_device_field_check):
    # get first device's serial:
    response = get_devices.sync_detailed(client=api_client)
    equal(response.status_code, 200)
    is_true(response.parsed.success)
    is_not_none(response.parsed.devices)
    greater(len(response.parsed.devices), 0)
    serial = response.parsed.devices[0].serial

    response = get_device_by_serial.sync_detailed(
        client=api_client,
        serial=serial,
        fields='wrong,,,,'
    )
    equal(response.status_code, 200)
    equal(response.parsed.description, 'Device Information')
    is_true(response.parsed.success)
    is_not_none(response.parsed.device)
    device_dict = response.parsed.device.to_dict()
    equal(len(device_dict.values()), 1)
    is_not_none(device_dict.get('reverseForwards'))
    equal(device_dict.get('reverseForwards'), [])
