## Transition to MongoDB

### Migration Process
We migrated the entire farm to MongoDB while preserving the existing logic and introducing optimizations.

### Requirements
To ensure proper functionality, MongoDB version 6.0.10 in replicaSet mode is required.

### Data Migration
If you need to migrate data from RethinkDB, you can use the following command:

```bash
stf migrate-to-mongo
```
