from enum import Enum

class UserRole(str, Enum):
    ADMIN = "admin"
    PARENT = "parent"
    CHILD = "child"

class ChildStatus(str, Enum):
    ACTIVE = "Active"
    INACTIVE = "Inactive" 