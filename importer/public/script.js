const SERVER_URL = "http://localhost:8080";

function fetchMetadata() {
  fetch(`${SERVER_URL}/api/metadata`)
    .then((response) => response.json())
    .then((body) => console.log(body))
    .catch((error) => console.error("Could not fetch the metadata", error));
}

/** @param {string} row */
function mapData(row) {
  let [item, qtd, value] = row.split(";");

  return { item, qtd, value };
}

/** @param {string} csvContent */
function fromCsv(csvContent) {
  const rows = csvContent.trim().split("\n");
  const dataList = rows.map((row) => mapData(row));

  const tableBodyElem = document.getElementById("tableBody");
  const tableFooterTotal = document.getElementById("tableFooterTotal");

  tableBodyElem.innerHTML = dataList
    .map(
      ({ item, qtd, value }, index) => `
      <tr>
        <td>${item}</td>
        <td><input id="${index}-qtd" name="${index}-qtd" type="text" value="${qtd}" /></td>
        <td><input id="${index}-value" name="${index}-value" type="text" value="${value}" /></td>
      </tr>
    `,
    )
    .join("");

  console.log(dataList.map(({ value }) => new Number(value)));
  tableFooterTotal.innerHTML = dataList.reduce(
    (acc, { value }) => (acc += new Number(value.replaceAll(",", "."))),
    0,
  );
}

/** @param {SubmitEvent} event */
function processCsv(event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const csvContent = formData.get("itemsCsv");

  fromCsv(csvContent);
}

document.addEventListener("DOMContentLoaded", () => {
  fetchMetadata();
  document.getElementById("csv-form").addEventListener("submit", processCsv);
});
