import { createServer } from "node:http";

const HOSTNAME = "127.0.0.1";
const PORT = 8080;
const NOTION_VERSION = "2026-03-11";
const NOTION_URL = "https://api.notion.com";
const DATABASE_ID = "f80a455e60c243909c0d0b3aa2f236a3";
const DATA_SOURCE_ID = "b692daee-6d3d-4bde-85a1-1aeae9ae1036";
const DEFAULT_HEADERS = {
  Authorization: `Bearer ${process.env.PAT}`,
  "Content-Type": "application/json",
  "Notion-Version": NOTION_VERSION,
};

/** @param {string} secret */
const SECRET_ERROR_MESSAGE_TEMPLATE = (secret) =>
  `Include ${secret} by exporting the variable or assign before starting the server`;

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

async function fetchDataSources() {
  try {
    const response = await fetch(
      `${NOTION_URL}/v1/data_sources/${DATA_SOURCE_ID}`,
      {
        method: "GET",
        headers: DEFAULT_HEADERS,
      },
    );
    return await response.json();
  } catch (error) {
    console.error(`Could not get the database`, error);
  }
  return null;
}

/** @param {{id: string; name: string; color: string; description: null | string}[]} options */
function mapOptions(options) {
  return options.map(({ id, name }) => ({ id, name }));
}

async function getEnumsMetadata() {
  const result = await fetchDataSources();
  if (!result) return {};

  const { properties } = result;
  const { Item: item, Para: location } = properties;
  const itemOptions = mapOptions(item.select.options);
  const locationOptions = mapOptions(location.select.options);

  return { itemOptions, locationOptions };
}

const server = createServer(({ url, method }, res) => {
  if (url == "/metadata" && method == "GET") {
    getEnumsMetadata().then((result) => {
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(result));
    });
    return;
  }

  console.warn("Not found", url, method);
  res.statusCode = 404;
  res.setHeader("Content-Type", "text/plain");
  res.end("Not Found!\n");
});

if (!process.env.PAT) throw new Error(SECRET_ERROR_MESSAGE_TEMPLATE("PAT"));

server.listen(PORT, HOSTNAME, () => {
  console.log(`Server running at http://${HOSTNAME}:${PORT}/`);
});
