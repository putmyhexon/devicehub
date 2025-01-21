import pytest
from pytest_check import equal, is_not_none, is_

from smartphone_test_farm_client.api.groups import get_groups, create_group, delete_group
from smartphone_test_farm_client.models import GroupListResponse, GroupPayload


def test_get_groups(api_client):
    response = get_groups.sync_detailed(client=api_client)
    assert response.parsed.success is True
    assert len(response.parsed.groups) > 0

def test_create_and_delete_once_group(api_client, random_str):
    name = f'Test-run-{random_str()}'
    new_group = GroupPayload(
        name=name,
    )
    response = create_group.sync_detailed(client=api_client, body=new_group)
    equal(response.status_code, 201)
    is_(response.parsed.success, True)
    equal(response.parsed.description, 'Created')
    is_not_none(response.parsed.group)
    equal(response.parsed.group.additional_properties.get('name'), name)
    equal(response.parsed.group.additional_properties.get('class'), 'once')

    group_id = response.parsed.group.additional_properties.get('id')
    response = delete_group.sync_detailed(client=api_client, id=group_id)
    equal(response.status_code, 200)
    is_(response.parsed.success, True)
    equal(response.parsed.description, 'Deleted (groups)')
