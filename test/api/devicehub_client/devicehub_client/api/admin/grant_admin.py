from http import HTTPStatus
from typing import Any, Dict, Optional, Union

import httpx

from ... import errors
from ...client import AuthenticatedClient, Client
from ...models.grant_admin_response_200 import GrantAdminResponse200
from ...types import Response


def _get_kwargs(
    email: str,
) -> Dict[str, Any]:
    _kwargs: Dict[str, Any] = {
        "method": "post",
        "url": f"/users/grantAdmin/{email}",
    }

    return _kwargs


def _parse_response(
    *, client: Union[AuthenticatedClient, Client], response: httpx.Response
) -> Optional[GrantAdminResponse200]:
    if response.status_code == 200:
        response_200 = GrantAdminResponse200.from_dict(response.json())

        return response_200
    if client.raise_on_unexpected_status:
        raise errors.UnexpectedStatus(response.status_code, response.content)
    else:
        return None


def _build_response(
    *, client: Union[AuthenticatedClient, Client], response: httpx.Response
) -> Response[GrantAdminResponse200]:
    return Response(
        status_code=HTTPStatus(response.status_code),
        content=response.content,
        headers=response.headers,
        parsed=_parse_response(client=client, response=response),
    )


def sync_detailed(
    email: str,
    *,
    client: Union[AuthenticatedClient, Client],
) -> Response[GrantAdminResponse200]:
    """Gets users

     gets users; if you are the administrator user then all user fields are returned, otherwise only
    'email'

    Args:
        email (str):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[GrantAdminResponse200]
    """

    kwargs = _get_kwargs(
        email=email,
    )

    response = client.get_httpx_client().request(
        **kwargs,
    )

    return _build_response(client=client, response=response)


def sync(
    email: str,
    *,
    client: Union[AuthenticatedClient, Client],
) -> Optional[GrantAdminResponse200]:
    """Gets users

     gets users; if you are the administrator user then all user fields are returned, otherwise only
    'email'

    Args:
        email (str):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        GrantAdminResponse200
    """

    return sync_detailed(
        email=email,
        client=client,
    ).parsed


async def asyncio_detailed(
    email: str,
    *,
    client: Union[AuthenticatedClient, Client],
) -> Response[GrantAdminResponse200]:
    """Gets users

     gets users; if you are the administrator user then all user fields are returned, otherwise only
    'email'

    Args:
        email (str):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[GrantAdminResponse200]
    """

    kwargs = _get_kwargs(
        email=email,
    )

    response = await client.get_async_httpx_client().request(**kwargs)

    return _build_response(client=client, response=response)


async def asyncio(
    email: str,
    *,
    client: Union[AuthenticatedClient, Client],
) -> Optional[GrantAdminResponse200]:
    """Gets users

     gets users; if you are the administrator user then all user fields are returned, otherwise only
    'email'

    Args:
        email (str):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        GrantAdminResponse200
    """

    return (
        await asyncio_detailed(
            email=email,
            client=client,
        )
    ).parsed
