from typing import TYPE_CHECKING, Any, Dict, List, Type, TypeVar, Union, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

if TYPE_CHECKING:
    from ..models.device_group_life_time_type_0 import DeviceGroupLifeTimeType0
    from ..models.device_group_owner_type_0 import DeviceGroupOwnerType0


T = TypeVar("T", bound="DeviceGroup")


@_attrs_define
class DeviceGroup:
    """
    Attributes:
        id (Union[Unset, str]):
        name (Union[Unset, str]):
        life_time (Union['DeviceGroupLifeTimeType0', None, Unset]):
        owner (Union['DeviceGroupOwnerType0', None, Unset]):
        origin (Union[Unset, str]):
        class_ (Union[Unset, str]):
        repetitions (Union[Unset, int]):
        origin_name (Union[Unset, str]):
        lock (Union[Unset, bool]):
        run_url (Union[None, Unset, str]):
    """

    id: Union[Unset, str] = UNSET
    name: Union[Unset, str] = UNSET
    life_time: Union["DeviceGroupLifeTimeType0", None, Unset] = UNSET
    owner: Union["DeviceGroupOwnerType0", None, Unset] = UNSET
    origin: Union[Unset, str] = UNSET
    class_: Union[Unset, str] = UNSET
    repetitions: Union[Unset, int] = UNSET
    origin_name: Union[Unset, str] = UNSET
    lock: Union[Unset, bool] = UNSET
    run_url: Union[None, Unset, str] = UNSET
    additional_properties: Dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        from ..models.device_group_life_time_type_0 import DeviceGroupLifeTimeType0
        from ..models.device_group_owner_type_0 import DeviceGroupOwnerType0

        id = self.id

        name = self.name

        life_time: Union[Dict[str, Any], None, Unset]
        if isinstance(self.life_time, Unset):
            life_time = UNSET
        elif isinstance(self.life_time, DeviceGroupLifeTimeType0):
            life_time = self.life_time.to_dict()
        else:
            life_time = self.life_time

        owner: Union[Dict[str, Any], None, Unset]
        if isinstance(self.owner, Unset):
            owner = UNSET
        elif isinstance(self.owner, DeviceGroupOwnerType0):
            owner = self.owner.to_dict()
        else:
            owner = self.owner

        origin = self.origin

        class_ = self.class_

        repetitions = self.repetitions

        origin_name = self.origin_name

        lock = self.lock

        run_url: Union[None, Unset, str]
        if isinstance(self.run_url, Unset):
            run_url = UNSET
        else:
            run_url = self.run_url

        field_dict: Dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if id is not UNSET:
            field_dict["id"] = id
        if name is not UNSET:
            field_dict["name"] = name
        if life_time is not UNSET:
            field_dict["lifeTime"] = life_time
        if owner is not UNSET:
            field_dict["owner"] = owner
        if origin is not UNSET:
            field_dict["origin"] = origin
        if class_ is not UNSET:
            field_dict["class"] = class_
        if repetitions is not UNSET:
            field_dict["repetitions"] = repetitions
        if origin_name is not UNSET:
            field_dict["originName"] = origin_name
        if lock is not UNSET:
            field_dict["lock"] = lock
        if run_url is not UNSET:
            field_dict["runUrl"] = run_url

        return field_dict

    @classmethod
    def from_dict(cls: Type[T], src_dict: Dict[str, Any]) -> T:
        from ..models.device_group_life_time_type_0 import DeviceGroupLifeTimeType0
        from ..models.device_group_owner_type_0 import DeviceGroupOwnerType0

        d = src_dict.copy()
        id = d.pop("id", UNSET)

        name = d.pop("name", UNSET)

        def _parse_life_time(data: object) -> Union["DeviceGroupLifeTimeType0", None, Unset]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, dict):
                    raise TypeError()
                life_time_type_0 = DeviceGroupLifeTimeType0.from_dict(data)

                return life_time_type_0
            except:  # noqa: E722
                pass
            return cast(Union["DeviceGroupLifeTimeType0", None, Unset], data)

        life_time = _parse_life_time(d.pop("lifeTime", UNSET))

        def _parse_owner(data: object) -> Union["DeviceGroupOwnerType0", None, Unset]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, dict):
                    raise TypeError()
                owner_type_0 = DeviceGroupOwnerType0.from_dict(data)

                return owner_type_0
            except:  # noqa: E722
                pass
            return cast(Union["DeviceGroupOwnerType0", None, Unset], data)

        owner = _parse_owner(d.pop("owner", UNSET))

        origin = d.pop("origin", UNSET)

        class_ = d.pop("class", UNSET)

        repetitions = d.pop("repetitions", UNSET)

        origin_name = d.pop("originName", UNSET)

        lock = d.pop("lock", UNSET)

        def _parse_run_url(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        run_url = _parse_run_url(d.pop("runUrl", UNSET))

        device_group = cls(
            id=id,
            name=name,
            life_time=life_time,
            owner=owner,
            origin=origin,
            class_=class_,
            repetitions=repetitions,
            origin_name=origin_name,
            lock=lock,
            run_url=run_url,
        )

        device_group.additional_properties = d
        return device_group

    @property
    def additional_keys(self) -> List[str]:
        return list(self.additional_properties.keys())

    def __getitem__(self, key: str) -> Any:
        return self.additional_properties[key]

    def __setitem__(self, key: str, value: Any) -> None:
        self.additional_properties[key] = value

    def __delitem__(self, key: str) -> None:
        del self.additional_properties[key]

    def __contains__(self, key: str) -> bool:
        return key in self.additional_properties
