// select all elements with the class "card-footer" that have the "data-region" attribute
var elementsDetails = document.querySelectorAll('.card-footer[data-region]');

// add a click event to each of them
elementsDetails.forEach(function (elemento) {
  elemento.addEventListener('click', function () {
    // get value of the region attribute
    var regionSelectUser = this.getAttribute('data-region');

    // Call function to fill the table with the selected region
    fillStateTable(regionSelectUser);
  });
});

// i fill the state table with a data that user selected region
async function fillStateTable(regionSelected) {
  const tableState = document.querySelector("#table1 tbody");

  try {
    const response = await fetch("https://brasilapi.com.br/api/ibge/uf/v1");
    const data = await response.json();

    // Filter the data based on the selected region
    const dadosFiltrados = data.filter(function (item) {
      return item.regiao.nome === regionSelected;
    });

    // Clear the table before filling it with new data
    tableState.innerHTML = "";

    // Loop through the filtered data and add each row to the table
    dadosFiltrados.forEach(function (item) {
      const row = tableState.insertRow();
      const regiaoCell = row.insertCell(0);
      const estadoCell = row.insertCell(1);
      const siglaCell = row.insertCell(2);

      regiaoCell.textContent = item.regiao.nome;
      estadoCell.textContent = item.nome;
      siglaCell.textContent = item.sigla;
    });
  } catch (error) {
    console.error("Error filling the table:", error);
  }
}

// Call the function to fill the table when the document is ready
document.addEventListener("DOMContentLoaded", fillStateTable);

// Function to make the request to the API and update the chart
async function updateChart(chart) {
  try {
    const response = await fetch("https://brasilapi.com.br/api/ibge/uf/v1");
    const data = await response.json();

    // Create an object to track the count of states by region
    const regionCount = {
      Norte: 0,
      Nordeste: 0,
      Sudeste: 0,
      Sul: 0,
      "Centro-Oeste": 0,
    };

    // Calculate the count of states by region
    data.forEach(item => {
      const regiao = item.regiao.nome;
      regionCount[regiao]++;
    });

    const ctx = chart.getContext("2d");
    const myChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: Object.keys(regionCount), // Use regions as labels
        datasets: [
          {
            label: "Number of States",
            data: Object.values(regionCount), // Use count values
            backgroundColor: [
              "rgba(255, 99, 132, 0.2)",
              "rgba(54, 162, 235, 0.2)",
              "rgba(255, 206, 86, 0.2)",
              "rgba(75, 192, 192, 0.2)",
              "rgba(153, 102, 255, 0.2)",
            ],
            borderColor: [
              "rgba(255, 99, 132, 1)",
              "rgba(54, 162, 235, 1)",
              "rgba(255, 206, 86, 1)",
              "rgba(75, 192, 192, 1)",
              "rgba(153, 102, 255, 1)",
            ],
            borderWidth: 1,
          },
        ],
      },
    });
  } catch (error) {
    console.error("Error updating the chart:", error);
  }
}

// Get the chart elements with the class ".chart" and call the updateChart function for each one
const charts = document.querySelectorAll(".chart");
charts.forEach(function (chart) {
  updateChart(chart);
});

let dataTableInitialized = false;

// Function to search for state abbreviation and populate the table
async function searchAbbreviationToCountry() {
  const table = document.querySelector("#countryTable tbody");
  table.innerHTML = ""; // Clear the table before populating it with new results

  // Get the state abbreviation from the text input field
  const stateAbbreviation = document.getElementById("ufInput").value.trim();

  if (!stateAbbreviation) {
    alert("Enter the state abbreviation (e.g., SP, MG) before searching.");
    return;
  }

  try {
    // Make a request to get the state name based on the abbreviation
    const stateResponse = await fetch(`https://brasilapi.com.br/api/ibge/uf/v1/${stateAbbreviation}`);
    const stateData = await stateResponse.json();

    // Check if the state abbreviation is valid
    if (stateData.nome) {
      const stateName = stateData.nome;

      // Display the state name on the page
      const stateNameElement = document.getElementById("stateName");
      stateNameElement.textContent = stateName;

      // Display the state image on the page
      let stateImage = document.getElementById("imageEstados");
      stateImage.src = "./images/" + stateAbbreviation + ".png";

      // Display the region name on the page
      let regionElement = document.getElementById("typeRegion");
      regionElement.textContent = stateData.regiao.nome;

      // Make a request to get municipalities based on the state abbreviation
      const municipalitiesResponse = await fetch(`https://brasilapi.com.br/api/ibge/municipios/v1/${stateAbbreviation}?providers=dados-abertos-br,gov,wikipedia`);
      const data = await municipalitiesResponse.json();

      let cityCount = 0;

      // Loop through the API data and add each municipality to the table
      data.forEach(item => {
        const row = table.insertRow();
        const nameCell = row.insertCell(0);
        const ibgeCodeCell = row.insertCell(1);

        nameCell.textContent = item.nome;
        ibgeCodeCell.textContent = item.codigo_ibge;
        cityCount++;
      });

      // Display the count of cities in the state
      let cityCountElement = document.getElementById("qtdCity");
      cityCountElement.textContent = cityCount;

      // Initialize the DataTable if it hasn't been initialized already
      if (!dataTableInitialized) {
        $("#countryTable").DataTable({
          pageLength: 10,
          paging: true
        });
        dataTableInitialized = true;
      }
    } else {
      alert("State abbreviation not found.");
    }
  } catch (error) {
    console.error("Error searching for municipalities:", error);
  }
}
