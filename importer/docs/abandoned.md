# Abandoned

## Backend with oAuth

```javascript
import { createServer } from "node:http";

const HOSTNAME = "127.0.0.1";
const PORT = 8080;
const CODE = "code";
const NOTION_VERSION = "2026-03-11";

/** @param {string} secret */
const SECRET_ERROR_MESSAGE_TEMPLATE = (secret) =>
  `Include ${secret} by exporting the variable or assign before starting the server`;

/** @param {string} url
 *  @param {string} query */
function extractQueryParam(url, query) {
  const urlParams = new URLSearchParams(url.split("?")[1]);
  let param = urlParams.get(query);
  if (!param) {
    console.error(`query: ${param} not present.`);
    param = "";
  }

  return param;
}

function generateEncodedValue() {
  const value = `${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`;

  return btoa(value);
}

/** @param {string} url */
function getToken(url) {
  const body = {
    grant_type: "authorization_code",
    code: extractQueryParam(url, CODE),
    redirect_uri: "http://localhost:8080/auth",
  };
  const headers = {
    Authorization: `Basic ${generateEncodedValue()}`,
    "Content-Type": "application/json",
    "Notion-Version": NOTION_VERSION,
  };

  fetch("https://api.notion.com/v1/oauth/token", {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  })
    .then((response) => response.json())
    .then((body) => console.log(body))
    .catch((error) => console.error(`Could not get the token`, error));
}

const server = createServer(({ url, method }, res) => {
  if (url.includes("/auth") && method === "GET") {
    res.statusCode = 200;
    getToken(url);
    res.setHeader("Content-Type", "text/plain");
    res.end("Hello, World!\n");
    return;
  }

  console.warn("Not found", url, method);
  res.statusCode = 404;
  res.setHeader("Content-Type", "text/plain");
  res.end("Not Found!\n");
});

if (!process.env.CLIENT_ID)
  throw new Error(SECRET_ERROR_MESSAGE_TEMPLATE("CLIENT_ID"));
if (!process.env.CLIENT_SECRET)
  throw new Error(SECRET_ERROR_MESSAGE_TEMPLATE("CLIENT_SECRET"));

server.listen(PORT, HOSTNAME, () => {
  console.log(`Server running at http://${HOSTNAME}:${PORT}/`);
});
```

## Fetch Database

```javascript
const DATABASE_ID = "f80a455e60c243909c0d0b3aa2f236a3";
async function fetchDatabases() {
  try {
    const response = await fetch(`${NOTION_URL}/v1/databases/${DATABASE_ID}`, {
      method: "GET",
      headers: DEFAULT_HEADERS,
    });

    return response.json();
  } catch (error) {
    console.error(`Could not get the database`, error);
  }
  return null;
}
```

## Query Data Source

```javascript
async function queryDataSource() {
  try {
    const response = await fetch(
      `${NOTION_URL}/v1/data_sources/${DATA_SOURCE_ID}/query`,
      {
        method: "POST",
        headers: DEFAULT_HEADERS,
      },
    );
    return await response.json();
  } catch (error) {
    console.error(`Could not create new data source`, error);
  }

  return null;
}
```
