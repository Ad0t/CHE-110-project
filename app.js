import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js"
import { getDatabase, ref, push } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js"

const appSettings = {
    databaseURL: "https://carbfootprincalc-default-rtdb.asia-southeast1.firebasedatabase.app/"
}

const app = initializeApp(appSettings)
const database = getDatabase(app)
const carbonDetailsInDB = ref(database, "carbonPrint")


const EMISSION_FACTORS = {
    "India": {
        "Transportation": 0.14,  // kgCO2/km
        "Electricity": 0.82,     // kgCO2/kWh
        "Diet": 1.25,            // kgCO2/meal
        "Waste": 0.1             // kgCO2/kg
    }
};

let myChart;


function calculateEmissions() {
    const country = "India";
    let distance = parseFloat(document.getElementById("distance").value) || 0;
    let electricity = parseFloat(document.getElementById("electricity").value) || 0;
    let waste = parseFloat(document.getElementById("waste").value) || 0;
    let meals = parseFloat(document.getElementById("meals").value) || 0;



    // Normalize inputs to yearly values
    distance = distance * 365;  // Convert daily distance to yearly
    electricity = electricity * 12;  // Convert monthly electricity to yearly
    waste = waste * 52;  // Convert weekly waste to yearly
    meals = meals * 365;  // Convert daily meals to yearly

    // Calculate emissions
    const transportationEmissions = (EMISSION_FACTORS[country]["Transportation"] * distance) / 1000;
    const electricityEmissions = (EMISSION_FACTORS[country]["Electricity"] * electricity) / 1000;
    const dietEmissions = (EMISSION_FACTORS[country]["Diet"] * meals) / 1000;
    const wasteEmissions = (EMISSION_FACTORS[country]["Waste"] * waste) / 1000;

    const totalEmissions = (transportationEmissions + electricityEmissions + dietEmissions + wasteEmissions).toFixed(2);

    // Create/update the chart
    createChart(transportationEmissions, electricityEmissions, dietEmissions, wasteEmissions);
    
    
    // Update results
    document.getElementById("transportation").textContent = `🚗 Transportation: ${transportationEmissions.toFixed(2)} tonnes CO2 per year`;


    // Update results
    document.getElementById("transportation").textContent = `🚗 Transportation: ${transportationEmissions.toFixed(2)} tonnes CO2 per year`;
    document.getElementById("electricityEmissions").textContent = `💡 Electricity: ${electricityEmissions.toFixed(2)} tonnes CO2 per year`;
    document.getElementById("dietEmissions").textContent = `🍽️ Diet: ${dietEmissions.toFixed(2)} tonnes CO2 per year`;
    document.getElementById("wasteEmissions").textContent = `🗑️ Waste: ${wasteEmissions.toFixed(2)} tonnes CO2 per year`;
    document.getElementById("totalEmissions").textContent = `🌍 Your total carbon footprint is: ${totalEmissions} tonnes CO2 per year`;

    // Show results section
    document.getElementById("results").style.display = "block";

    setTimeout(() => {
        createChart(transportationEmissions, electricityEmissions, dietEmissions, wasteEmissions);
    }, 0);

    // Store emissions data in the database
    push(carbonDetailsInDB, {
        transportation: transportationEmissions,
        electricity: electricityEmissions,
        diet: dietEmissions,
        waste: wasteEmissions,
        total: totalEmissions,
        timestamp: new Date().toISOString()  // Add a timestamp for reference
    });
}
// Attach the calculateEmissions function to the button click event
document.getElementById("calculateButton").addEventListener("click", calculateEmissions);


function createChart(transportationEmissions, electricityEmissions, dietEmissions, wasteEmissions) {
    const ctx = document.getElementById('emissionsChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (myChart) {
        myChart.destroy();
    }
    
    myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Transportation', 'Electricity', 'Diet', 'Waste'],
            datasets: [{
                label: 'Emissions (tonnes CO2 per year)',
                data: [transportationEmissions, electricityEmissions, dietEmissions, wasteEmissions],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                    'rgba(75, 192, 192, 0.6)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}