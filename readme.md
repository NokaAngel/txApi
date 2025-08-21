# txApi
FiveM exports for txAdmin actions. Perform bans, kicks, warnings, and unbans using txAdmin's system, keeping all moderation actions in one centralized place for easier management.

## Installation
1. Download the resource and add it to your server's resources folder.
2. Create a new txAdmin user with the necessary permissions (e.g., `players.ban`, `players.kick`, `players.warn`).
3. Log in to this user in txAdmin to set a password.
4. Update the credentials in `server.js` (txAdminUrl, txAdminPort, txAdminUsername, txAdminPassword).
5. Add `ensure txApi` near the top of your `server.cfg` to start it before other resources that use it.
6. Restart your server!

## Exports
All exports are asynchronous and return a Promise with the result (e.g., `{ banId: 'cfxb_xxxx' }` for bans or `{ success: true }` for others). Use them in Lua via `exports['txApi']:txApi_actionName(...)`.

### txApi:banPlayer
Bans a player using their identifiers.

**Permissions Needed:** `players.ban`

**Arguments:**
- `identifiers` (table/array): Array of player identifiers (e.g., `{'license:abc123', 'steam:1100001abc123'}`).
- `reason` (string, optional): Ban reason. Defaults to 'No reason given'.
- `duration` (string, optional): Ban duration (e.g., 'permanent', '1d', '2h'). Defaults to 'permanent'.

**Example (Lua):**
```lua
exports['txApi']:txApi_banPlayer({'license:abc123', 'steam:1100001abc123'}, "Cheating detected", "permanent")
```

### txApi:kickPlayer
Kicks a player from the server.

**Permissions Needed:** `players.kick`

**Arguments:**
- `playerId` (number): The player's source ID.
- `reason` (string, optional): Kick reason. Defaults to 'No reason given'.

**Example (Lua):**
```lua
exports['txApi']:txApi_kickPlayer(69, "Idle too long")
```

### txApi:warnPlayer
Issues a warning to a player.

**Permissions Needed:** `players.warn`

**Arguments:**
- `playerId` (number): The player's source ID.
- `reason` (string, optional): Warn reason. Defaults to 'No reason given'.

**Example (Lua):**
```lua
exports['txApi']:txApi_warnPlayer(69, "Breaking rules")
```

### txApi:unbanPlayer
Revokes a ban by its ID.

**Permissions Needed:** `players.ban`

**Arguments:**
- `banId` (string): The ban ID (e.g., 'cfxb_xxxx').
- `reason` (string, optional): Revoke reason. Defaults to 'No reason given'.

**Example (Lua):**
```lua
exports['txApi']:txApi_unbanPlayer("cfxb_12345", "False positive")
```

## Notes
- The script logs in to txAdmin for each action and logs out afterward to perform the request securely.
- Ensure your txAdmin user has the correct permissions; otherwise, actions will fail.
- For bans, collect identifiers using `GetPlayerIdentifiers(source)` in your scripts.
- Ban IDs are returned in the response and can be found in txAdmin's ban list.

## Credits
Built from the original txApi by GJSBRT.

## Todo
- Improve authentication by keeping the session active longer (e.g., token-based).
- Add configurable debug logging.
- Add more exports (e.g., get ban list, player info). Feel free to contribute via pull request! 😊
