# Notion Market Importer

## About

### Scope

- HTML, JS and CSS only;
- Don't save any key. Keep in memory during session.
- Must receive a CSV, process the data and show in table format.
- User must complete the missing values.
- Submit will add the values to "Compras" table in notion.

### TODO

- [ ] Create Base HTML and JS.
- [x] Test notion integration.
- [x] Get `Enum` values from notion.
- [ ] Final: CSS.

### Getting Started

Use the command `node --watch --env-file=.env main.js` to start the server, with hot reload and environment secrets. The secret is the Notion's Personal Access Token: `PAT=MY_TOKEN`.

## Integration

### Auth

Describing authentication methods used.

#### OAuth

- Use the `oauth/authorize` to allow the connection and select the page. This will generate a code for the token generation.
    - `https://api.notion.com/v1/oauth/authorize?client_id=<CLIENT_ID>&response_type=code&owner=user&redirect_uri=<REDIRECT_URI>`
    - Can be used in a link tag.
    - Code will be present in the URL: `http://host.com/?code=<CODE>&state=`
- To generate the token we need have the `code` (from previous step), `CLIENT_ID` and `CLIENT_SECRET`.
    - We need to generate an `encoded-value`, by generating a `base64` from `CLIENT_ID:CLIENT_SECRET`, joined by `:`.
    - `printf '%s' "CLIENT_ID:CLIENT_SECRET" | base64`. The docs recommend using `printf` instead of `echo` to avoid trailing newline.
    - The `notion-version` can be found in [Changes by version](https://developers.notion.com/reference/changes-by-version).
    - Request exemple:
    ```bash
    curl --request POST \
      --url https://api.notion.com/v1/oauth/token \
      --header 'Authorization: Basic <encoded-value>' \
      --header 'Content-Type: application/json' \
      --header 'Notion-Version: <notion-version>' \
      --data '
    {
      "grant_type": "authorization_code",
      "code": "<string>",
      "redirect_uri": "<string>"
    }
    '
    ```
- This requires a server, may not be worth it, we can use the API_TOKEN or PAT instead.

#### Personal access token

- We can use a [Personal Access Token](https://developers.notion.com/guides/connections-and-tokens/personal-access-tokens) or PAT to use in the `Authorization` as `bearer` instead.
- This worked as expected and will be used.

### Data management

- `/v1/databases/{DATABASE_ID}` can get details from database by id. The id can be extract from the database URL: `https://app.notion.com/p/<USER>/<DATABASE_ID>`.
    - The most important information for our use case is the `data_sources` array, which include the `id`, that can be used to fetch the properties values and configuration.
- `/v1/data_sources/{DATA_SOURCE_ID}` can get the properties details from a database. For ouse case, we need to extract from `properties.<PROPERTY_NAME>.select.options` the `id` and `name`.
