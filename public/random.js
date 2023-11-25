'use strict';

let eventCount = 0;

// Function to render a row of results from the API
function renderRow(results) {
    // Create a table row (tr) and set its innerHTML with the data
    const row = document.createElement('tr');
    row.innerHTML = `
    <td><img src="${results.picture.thumbnail}" alt="Profile Picture"></td>
    <td><a href="mailto:${results.email}">${results.email}</a></td>
    <td>${results.name.first} ${results.name.last}</td>
    <td>${results.phone}</td>
    <td>${results.location.city}</td>
  `;

    //console.log(results.picture.thumbnail);

    // Append the row to a tbody element in your HTML
    const tbody = document.getElementById("resultsTableBody");

    //console.log(tbody);
    tbody.appendChild(row);
}

function updateStatusMessage(message) {
    // Create a table row (tr) and set its innerHTML with the data


    const row = document.createElement('tr');
    row.innerHTML = `
    <td>API Service Status: ${message}</td>
  `;

    // Append the row to a tbody element in your HTML
    const tbody2 = document.getElementById("apiStatus");

    while (tbody2.firstChild) {
        tbody2.removeChild(tbody2.firstChild);
    }

    tbody2.appendChild(row);

}


// Asynchronous function to fetch data when a button is clicked
async function fetchData(event) {
    event.preventDefault(); // Prevent default form submission

    const urlName = 'https://randomuser.me/api/';

    try {
        const response = await fetch(urlName); // Make a GET request to the API
        if (!response.ok) {
            throw new Error('Network response was not ok');

        }

        //Pull and clean the data
        let data = await response.json(); // Parse response as JSON
        data = data.results[0];

        renderRow(data);

        eventCount++;

        if (eventCount % 10 === 0) {
            updateStatusMessage("Good");
            console.log(`Event Count: ${eventCount} - Timestamp: ${new Date().toISOString()}`);
          }

        updateStatusMessage("Good");

        //console.log(data);

    } catch (error) {
        // Handle any errors that occurred during the GET request
        updateStatusMessage("Bad");
        console.error('Error:', error);
    }
}


// Add an event listener when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const button = document.getElementById('createAccount'); // Replace 'fetchButton' with the actual button id
    button.addEventListener('click', fetchData);

});
