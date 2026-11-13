const SERVER_URL = "http://localhost:8080";

function fetchMetadata() {
  fetch(`${SERVER_URL}/api/metadata`)
    .then((response) => response.json())
    .then((body) => console.log(body))
    .catch((error) => console.error("Could not fetch the metadata", error));
}

document.addEventListener("DOMContentLoaded", () => {
  fetchMetadata();
});
