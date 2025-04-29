// Add styles for autocomplete
const style = document.createElement('style');
style.textContent = `
    .autocomplete-list {
        display: none;
        position: absolute;
        z-index: 1000;
        max-height: 200px;
        overflow-y: auto;
        background: white;
        border: 1px solid #ddd;
        border-radius: 4px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        width: 100%;
        margin-top: 2px;
        padding: 0;
        list-style: none;
    }

    .autocomplete-list li {
        padding: 10px;
        cursor: pointer;
        transition: background-color 0.2s;
    }

    .autocomplete-list li:hover {
        background-color: #f5f5f5;
    }
`;
document.head.appendChild(style);

document.addEventListener('DOMContentLoaded', function() {
    // Initialize date pickers
    flatpickr("#startDate", {
        minDate: "today",
        dateFormat: "Y-m-d",
        onChange: function(selectedDates) {
            // Update end date minimum date when start date is selected
            endDatePicker.set("minDate", selectedDates[0]);
        }
    });
    
    const endDatePicker = flatpickr("#endDate", {
        minDate: "today",
        dateFormat: "Y-m-d"
    });

    // Check if we're viewing a specific trip
    const urlParams = new URLSearchParams(window.location.search);
    const viewIndex = urlParams.get('view');
    
    if (viewIndex !== null) {
        const trips = JSON.parse(localStorage.getItem('trips') || '[]');
        const trip = trips[viewIndex];
        if (trip) {
            showTripDetails(trip);
        }
    }

    // Toggle between Create and Join Trip forms
    const createTripBtn = document.getElementById('createTripBtn');
    const joinTripBtn = document.getElementById('joinTripBtn');
    const createTripForm = document.getElementById('createTripForm');
    const joinTripForm = document.getElementById('joinTripForm');

    createTripBtn.addEventListener('click', function() {
        createTripBtn.classList.add('active');
        joinTripBtn.classList.remove('active');
        createTripForm.classList.remove('hidden');
        joinTripForm.classList.add('hidden');
    });

    joinTripBtn.addEventListener('click', function() {
        joinTripBtn.classList.add('active');
        createTripBtn.classList.remove('active');
        joinTripForm.classList.remove('hidden');
        createTripForm.classList.add('hidden');
    });

    // Handle trip form submission
    const tripForm = document.getElementById('tripForm');
    tripForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const tripData = {
            tripName: document.getElementById('tripName').value,
            destination: document.getElementById('destination').value,
            destinationDetails: selectedLocation || null,
            startDate: document.getElementById('startDate').value,
            endDate: document.getElementById('endDate').value,
            activities: [],
            status: 'Upcoming',
            createdAt: new Date().toISOString()
        };

        // Save trip data to localStorage
        const trips = JSON.parse(localStorage.getItem('trips') || '[]');
        trips.push(tripData);
        localStorage.setItem('trips', JSON.stringify(trips));
        
        console.log('Trip saved:', tripData);
        console.log('All trips:', trips);

        window.location.href = './my-trips.html';
    });

    // Handle join trip form submission
    const joinForm = document.getElementById('joinTripForm').querySelector('form');
    joinForm.addEventListener('submit', function(e) {
        e.preventDefault();
        alert('Join trip functionality coming soon!');
    });

    // Edit trip button functionality
    const editTripBtn = document.getElementById('editTripBtn');
    if (editTripBtn) {
        editTripBtn.addEventListener('click', function() {
            const tripDetailsSection = document.getElementById('tripDetailsSection');
            const createTripSection = document.getElementById('createTripSection');
            
            tripDetailsSection.classList.add('hidden');
            createTripSection.classList.remove('hidden');
            
            // Populate form with current trip data
            const currentTripIndex = localStorage.getItem('currentTripIndex');
            const trips = JSON.parse(localStorage.getItem('trips') || '[]');
            const currentTrip = trips[currentTripIndex];
            
            if (currentTrip) {
                document.getElementById('tripName').value = currentTrip.tripName;
                document.getElementById('destination').value = currentTrip.destination;
                document.getElementById('startDate').value = currentTrip.startDate;
                document.getElementById('endDate').value = currentTrip.endDate;
            }
        });
    }

    // Share button functionality
    const shareBtn = document.querySelector('.action-btn.share');
    if (shareBtn) {
        shareBtn.addEventListener('click', function() {
            const tripName = document.getElementById('tripNameDisplay').textContent;
            const destination = document.getElementById('destinationDisplay').textContent;
            
            const shareText = `Check out my trip to ${tripName} in ${destination}!`;
            
            if (navigator.share) {
                navigator.share({
                    title: 'Share Trip',
                    text: shareText,
                    url: window.location.href
                }).catch(console.error);
            } else {
                navigator.clipboard.writeText(shareText + ' ' + window.location.href)
                    .then(() => alert('Trip details copied to clipboard!'))
                    .catch(console.error);
            }
        });
    }

    // Initialize Exchange Rate Converter
    initializeExchangeRate();

    // Initialize Voting System
    initializeVotingSystem();

    // Initialize expense categories with totals and colors
    const expenseCategories = {
        Food: { total: 0, color: '#FF6384' },
        Shopping: { total: 0, color: '#36A2EB' },
        Activities: { total: 0, color: '#4BC0C0' },
        Miscellaneous: { total: 0, color: '#FFCE56' }
    };

    // Initialize the pie chart
    let expenseChart;
    function initializeExpenseChart() {
        const ctx = document.getElementById('expenseChart').getContext('2d');
        expenseChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: Object.keys(expenseCategories),
                datasets: [{
                    data: Object.values(expenseCategories).map(cat => cat.total),
                    backgroundColor: Object.values(expenseCategories).map(cat => cat.color)
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    title: {
                        display: true,
                        text: 'Expenses by Category'
                    }
                }
            }
        });
    }

    // Function to update the chart
    function updateChart() {
        expenseChart.data.datasets[0].data = Object.values(expenseCategories).map(cat => cat.total);
        expenseChart.update();
    }

    // Function to format currency
    function formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }

    // Function to add a new expense
    function addExpense() {
        const amount = parseFloat(document.getElementById('expenseAmount').value);
        const category = document.getElementById('expenseCategory').value;
        const description = document.getElementById('expenseDescription').value;

        if (!amount || !category || !description) {
            alert('Please fill in all fields');
            return;
        }

        // Update category total
        expenseCategories[category].total += amount;

        // Update chart
        updateChart();

        // Add to expenses list
        const expensesList = document.getElementById('expensesList');
        const expenseItem = document.createElement('div');
        expenseItem.className = 'expense-item';
        expenseItem.innerHTML = `
            <div class="expense-details">
                <div class="expense-description">${description}</div>
                <div class="expense-category">${category}</div>
            </div>
            <div class="expense-amount">${formatCurrency(amount)}</div>
            <button class="delete-expense" onclick="deleteExpense(this, '${category}', ${amount})">
                <i class="fas fa-trash"></i>
            </button>
        `;
        expensesList.appendChild(expenseItem);

        // Clear form
        document.getElementById('expenseAmount').value = '';
        document.getElementById('expenseCategory').value = '';
        document.getElementById('expenseDescription').value = '';
    }

    // Function to delete an expense
    function deleteExpense(button, category, amount) {
        if (confirm('Are you sure you want to delete this expense?')) {
            expenseCategories[category].total -= amount;
            updateChart();
            button.closest('.expense-item').remove();
        }
    }

    // Initialize expense chart
    initializeExpenseChart();

    // Add expense button click handler
    const addExpenseBtn = document.getElementById('addExpenseBtn');
    if (addExpenseBtn) {
        addExpenseBtn.addEventListener('click', function(e) {
            e.preventDefault();
            addExpense();
        });
    }

    // Make deleteExpense function globally available
    window.deleteExpense = deleteExpense;

    // Add autocomplete for destination
    const destinationInput = document.getElementById('destination');
    const autocompleteList = document.createElement('ul');
    autocompleteList.className = 'autocomplete-list';
    destinationInput.parentNode.appendChild(autocompleteList);

    let debounceTimer;
    let selectedLocation = null;

    destinationInput.addEventListener('input', function() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            const searchText = this.value.trim();
            if (searchText.length >= 2) {
                fetchLocationDetails(searchText);
            } else {
                autocompleteList.innerHTML = '';
                autocompleteList.style.display = 'none';
            }
        }, 300);
    });

    async function fetchLocationDetails(text) {
        try {
            const response = await fetch(
                `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(text)}&apiKey=${GEO_API_KEY}`,
                { method: 'GET' }
            );
            const data = await response.json();
            
            if (data.features) {
                displayLocationSuggestions(data.features);
            }
        } catch (error) {
            console.error('Error fetching location details:', error);
        }
    }

    function displayLocationSuggestions(locations) {
        autocompleteList.innerHTML = '';
        
        locations.forEach(location => {
            const properties = location.properties;
            const li = document.createElement('li');
            
            // Create a detailed address display
            const addressLine1 = properties.address_line1 || '';
            const addressLine2 = properties.address_line2 || '';
            const formattedAddress = properties.formatted || '';

            li.innerHTML = `
                <div class="location-suggestion">
                    <div class="location-main">${addressLine1}</div>
                    <div class="location-sub">${addressLine2}</div>
                </div>
            `;
            
            li.addEventListener('click', () => {
                selectedLocation = {
                    formatted: formattedAddress,
                    address_line1: addressLine1,
                    address_line2: addressLine2,
                    city: properties.city,
                    state: properties.state,
                    country: properties.country,
                    postcode: properties.postcode,
                    lat: properties.lat,
                    lon: properties.lon,
                    timezone: properties.timezone
                };
                destinationInput.value = formattedAddress;
                autocompleteList.style.display = 'none';
                
                // Create or update hidden inputs for additional location data
                updateHiddenLocationFields(selectedLocation);
            });
            
            autocompleteList.appendChild(li);
        });
        
        autocompleteList.style.display = locations.length ? 'block' : 'none';
    }

    function updateHiddenLocationFields(location) {
        // Create or update hidden inputs for the form
        const form = destinationInput.closest('form');
        if (form) {
            const fields = [
                'address_line1',
                'address_line2',
                'city',
                'state',
                'country',
                'postcode',
                'lat',
                'lon'
            ];
            fields.forEach(field => {
                let input = form.querySelector(`input[name="destination_${field}"]`);
                if (!input) {
                    input = document.createElement('input');
                    input.type = 'hidden';
                    input.name = `destination_${field}`;
                    form.appendChild(input);
                }
                input.value = location[field] || '';
            });
        }
    }

    // Update styles for location suggestions
    const locationStyle = document.createElement('style');
    locationStyle.textContent = `
        .location-suggestion {
            padding: 8px 12px;
        }

        .location-main {
            font-size: 14px;
            color: #333;
            margin-bottom: 4px;
        }

        .location-sub {
            font-size: 12px;
            color: #666;
        }

        .autocomplete-list li:hover .location-main {
            color: #007bff;
        }

        .autocomplete-list li:hover {
            background-color: #f8f9fa;
        }
    `;
    document.head.appendChild(locationStyle);

    // Close autocomplete list when clicking outside
    document.addEventListener('click', function(e) {
        if (e.target !== destinationInput) {
            autocompleteList.style.display = 'none';
        }
    });

    // Initialize weather tracker
    initializeWeatherTracker();
});

// Function to show trip details
function showTripDetails(tripData) {
    const createTripSection = document.getElementById('createTripSection');
    const tripDetailsSection = document.getElementById('tripDetailsSection');

    // Update trip details display
    document.getElementById('tripNameDisplay').textContent = tripData.tripName;
    document.getElementById('destinationDisplay').textContent = tripData.destination;
    document.getElementById('datesDisplay').textContent = `${tripData.startDate} - ${tripData.endDate}`;

    // Hide create section and show details section
    createTripSection.classList.add('hidden');
    tripDetailsSection.classList.remove('hidden');

    // Load activities specific to this trip
    loadActivities(tripData);
}

// Exchange Rate Functions
function initializeExchangeRate() {
    const amount = document.getElementById('amount');
    const fromCurrency = document.getElementById('fromCurrency');
    const toCurrency = document.getElementById('toCurrency');

    if (amount && fromCurrency && toCurrency) {
        [amount, fromCurrency, toCurrency].forEach(element => {
            element.addEventListener('change', updateExchangeRate);
        });

        // Initial conversion
        updateExchangeRate();
    }
}

async function updateExchangeRate() {
    const amount = document.getElementById('amount').value;
    const from = document.getElementById('fromCurrency').value;
    const to = document.getElementById('toCurrency').value;

    try {
        const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${from}`);
        const data = await response.json();
        const rate = data.rates[to];
        const convertedAmount = (amount * rate).toFixed(2);
        document.getElementById('convertedAmount').textContent = convertedAmount;
    } catch (error) {
        console.error('Error fetching exchange rate:', error);
    }
}

// Voting System Functions
function initializeVotingSystem() {
    const addActivityBtn = document.getElementById('addActivityBtn');
    if (addActivityBtn) {
        addActivityBtn.addEventListener('click', addNewActivity);
        
        // Load saved activities for the current trip
        const currentTripIndex = localStorage.getItem('currentTripIndex');
        if (currentTripIndex !== null) {
            const trips = JSON.parse(localStorage.getItem('trips') || '[]');
            const currentTrip = trips[currentTripIndex];
            if (currentTrip) {
                loadActivities(currentTrip);
            }
        }
    }
}

function addNewActivity() {
    const input = document.getElementById('newActivity');
    const activityText = input.value.trim();

    if (activityText) {
        const currentTripIndex = localStorage.getItem('currentTripIndex');
        const trips = JSON.parse(localStorage.getItem('trips') || '[]');
        
        if (!trips[currentTripIndex].activities) {
            trips[currentTripIndex].activities = [];
        }

        trips[currentTripIndex].activities.push({
            text: activityText,
            votes: 0
        });

        localStorage.setItem('trips', JSON.stringify(trips));
        input.value = '';
        loadActivities(trips[currentTripIndex]);
    }
}

function loadActivities(tripData) {
    const activitiesList = document.querySelector('.activities-list');
    if (activitiesList) {
        const activities = tripData.activities || [];

        activitiesList.innerHTML = activities.map((activity, index) => `
            <div class="activity-item">
                <span class="activity-text">${activity.text}</span>
                <div class="vote-section">
                    <span class="vote-count">${activity.votes} votes</span>
                    <button class="vote-btn" onclick="vote(${index})">
                        <i class="fas fa-thumbs-up"></i> Vote
                    </button>
                </div>
            </div>
        `).join('');
    }
}

function vote(index) {
    const currentTripIndex = localStorage.getItem('currentTripIndex');
    const trips = JSON.parse(localStorage.getItem('trips') || '[]');
    
    if (trips[currentTripIndex].activities && trips[currentTripIndex].activities[index]) {
        trips[currentTripIndex].activities[index].votes += 1;
        localStorage.setItem('trips', JSON.stringify(trips));
        loadActivities(trips[currentTripIndex]);
    }
}

// Make vote function globally available
window.vote = vote;

// Weather API functions
const GEO_API_KEY = 'cac3923cef164a92bec0a99632bafc53'; // Geoapify API key

// Weather tracking functionality
function initializeWeatherTracker() {
    // Find the existing weather container
    const weatherContainer = document.querySelector('.weather-container');
    if (!weatherContainer) return;

    // Get the search elements
    const searchBtn = document.querySelector('#searchWeather');
    const locationInput = document.querySelector('#locationSearch');

    if (!searchBtn || !locationInput) return;

    // Add unit toggle button
    const searchContainer = locationInput.parentElement;
    const unitToggle = document.createElement('button');
    unitToggle.className = 'btn btn-outline-secondary unit-toggle';
    unitToggle.innerHTML = '°C / °F';
    unitToggle.style.marginLeft = '10px';
    searchContainer.appendChild(unitToggle);

    // Track current unit
    let isMetric = true;

    // Add event listener for unit toggle
    unitToggle.addEventListener('click', () => {
        isMetric = !isMetric;
        const location = locationInput.value.trim();
        if (location) {
            fetchWeather(location, weatherContainer, isMetric);
        }
    });

    // Add event listeners for search
    searchBtn.addEventListener('click', () => {
        const location = locationInput.value.trim();
        if (location) {
            fetchWeather(location, weatherContainer, isMetric);
        }
    });

    locationInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const location = locationInput.value.trim();
            if (location) {
                fetchWeather(location, weatherContainer, isMetric);
            }
        }
    });
}

async function fetchWeather(city, container, isMetric = true) {
    try {
        // Show loading state
        container.innerHTML = `
            <div class="current-weather">
                <div class="weather-icon">
                    <i class="fas fa-spinner fa-spin"></i>
                </div>
                <div class="weather-info">
                    <div class="location">Loading...</div>
                    <div class="temperature">--${isMetric ? '°C' : '°F'}</div>
                    <div class="description">Fetching weather data...</div>
                </div>
            </div>
        `;

        // Use OpenWeatherMap API with direct city query
        const OPENWEATHER_API_KEY = 'caba5e2e7fa53eaad48af0316e9e1063';
        const units = isMetric ? 'metric' : 'imperial';
        
        // Format the query to include state/country code if provided
        const [cityName, stateCode] = city.split(',').map(part => part.trim());
        const query = stateCode ? `${cityName},${stateCode},US` : cityName;
        
        const weatherResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(query)}&appid=${OPENWEATHER_API_KEY}&units=${units}`,
            { method: 'GET' }
        );

        if (!weatherResponse.ok) {
            if (weatherResponse.status === 404) {
                throw new Error('City not found. Try adding the state code (e.g., Montclair, NJ)');
            }
            throw new Error('Weather data not available');
        }
        
        const weatherData = await weatherResponse.json();
        
        // Update UI with current weather data
        updateWeatherUI(weatherData, city, container, isMetric);

    } catch (error) {
        container.innerHTML = `
            <div class="current-weather">
                <div class="weather-icon">
                    <i class="fas fa-exclamation-circle"></i>
                </div>
                <div class="weather-info">
                    <div class="location">Error</div>
                    <div class="temperature">--${isMetric ? '°C' : '°F'}</div>
                    <div class="description">${error.message || 'Failed to load weather data'}</div>
                </div>
            </div>
        `;
    }
}

function updateWeatherUI(data, city, container, isMetric) {
    const tempUnit = isMetric ? '°C' : '°F';
    const speedUnit = isMetric ? 'm/s' : 'mph';

    container.innerHTML = `
        <div class="current-weather">
            <div class="weather-icon">
                <i class="${getWeatherIcon(data.clouds.all, data.rain?.['1h'] || 0)}"></i>
            </div>
            <div class="weather-info">
                <div class="location">${city}</div>
                <div class="temperature">${Math.round(data.main.temp)}${tempUnit}</div>
                <div class="description">${data.weather[0].description}</div>
            </div>
        </div>
        <div class="weather-details">
            <div class="detail">
                <i class="fas fa-temperature-high"></i>
                <span>High</span>
                <span class="high">${Math.round(data.main.temp_max)}${tempUnit}</span>
            </div>
            <div class="detail">
                <i class="fas fa-temperature-low"></i>
                <span>Low</span>
                <span class="low">${Math.round(data.main.temp_min)}${tempUnit}</span>
            </div>
            <div class="detail">
                <i class="fas fa-tint"></i>
                <span>Humidity</span>
                <span class="humidity">${Math.round(data.main.humidity)}%</span>
            </div>
            <div class="detail">
                <i class="fas fa-wind"></i>
                <span>Wind</span>
                <span class="wind">${Math.round(data.wind.speed)} ${speedUnit}</span>
            </div>
        </div>
    `;
}

function getWeatherIcon(cloudCover, precipitation) {
    if (precipitation > 0) return 'fas fa-cloud-rain';
    if (cloudCover < 20) return 'fas fa-sun';
    if (cloudCover < 50) return 'fas fa-cloud-sun';
    return 'fas fa-cloud';
}

function formatForecastDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
} 