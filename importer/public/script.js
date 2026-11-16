/** @typedef {Object} CsvData
 * @property {}
 * @property {string} item
 * @property {number} qtd
 * @property {number} value
 */
const SERVER_URL = "http://localhost:8080";
/** @type {CsvData[]} */
let csvDataList = [];

function fetchMetadata() {
  fetch(`${SERVER_URL}/api/metadata`)
    .then((response) => response.json())
    .then((body) => console.log(body))
    .catch((error) => console.error("Could not fetch the metadata", error));
}

/** @param {string} value */
function strToNumber(value) {
  return Number(value.replaceAll(",", "."));
}

/** @param {string} row */
function mapData(row) {
  let [item, qtdStr, valueStr] = row.split(";");
  const qtd = strToNumber(qtdStr);
  const value = strToNumber(valueStr);

  return { item, qtd, value };
}

function updateTableFooter() {
  const tableFooterTotal = document.getElementById("tableFooterTotal");
  tableFooterTotal.innerHTML = csvDataList.reduce(
    (acc, { value }) => (acc += value),
    0,
  );
}

/** @param {string} csvContent */
function fromCsv(csvContent) {
  const rows = csvContent.trim().split("\n");
  csvDataList = rows.map((row) => mapData(row));

  const tableBodyElem = document.getElementById("tableBody");

  tableBodyElem.innerHTML = csvDataList
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

  updateTableFooter();
}

/** @param {SubmitEvent} event */
function processCsv(event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const csvContent = formData.get("itemsCsv");

  fromCsv(csvContent);
}

/** @param {Event} event */
function onTableFormChange(event) {
  const value = event.target.value;
  const [indexStr, field] = event.target.id.split("-");
  const index = Number(indexStr);
  switch (field) {
    case "qtd":
      csvDataList[index].qtd = Number(value);
      break;
    default:
      csvDataList[index].value = Number(value);
      break;
  }
  updateTableFooter();
}

document.addEventListener("DOMContentLoaded", () => {
  fetchMetadata();
  document.getElementById("csv-form").addEventListener("submit", processCsv);
  document
    .getElementById("table-form")
    .addEventListener("change", onTableFormChange);
});
