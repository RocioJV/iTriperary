document.addEventListener('DOMContentLoaded', function() {
    console.log('My Trips page loaded');
    
    // Check if trips exist in localStorage
    const trips = JSON.parse(localStorage.getItem('trips') || '[]');
    console.log('Retrieved trips from localStorage:', trips);

    loadTrips('all');
    initializeFilters();
});

function initializeFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    console.log('Filter buttons found:', filterButtons.length);

    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            // Load filtered trips
            const filter = this.dataset.filter;
            console.log('Filter selected:', filter);
            loadTrips(filter);
        });
    });
}

function loadTrips(filter) {
    console.log('Loading trips with filter:', filter);

    const tripsGrid = document.querySelector('.trips-grid');
    const noTripsMessage = document.querySelector('.no-trips-message');
    
    if (!tripsGrid || !noTripsMessage) {
        console.error('Required elements not found');
        return;
    }

    const trips = JSON.parse(localStorage.getItem('trips') || '[]');
    console.log('All trips:', trips);

    // Filter trips based on dates
    const currentDate = new Date();
    let filteredTrips = trips;
    
    if (filter === 'upcoming') {
        filteredTrips = trips.filter(trip => new Date(trip.startDate) >= currentDate);
    } else if (filter === 'past') {
        filteredTrips = trips.filter(trip => new Date(trip.endDate) < currentDate);
    }

    // Sort the filtered trips
    filteredTrips = sortTrips(filteredTrips, filter);
    console.log('Filtered and sorted trips:', filteredTrips);

    if (filteredTrips.length === 0) {
        console.log('No trips to display');
        tripsGrid.innerHTML = '';
        noTripsMessage.classList.remove('hidden');
        return;
    }

    noTripsMessage.classList.add('hidden');
    const tripCardsHTML = filteredTrips.map((trip, index) => createTripCard(trip, index)).join('');
    console.log('Generated trip cards HTML');
    tripsGrid.innerHTML = tripCardsHTML;
}

function calculateTripDuration(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

function calculateTripProgress(startDate, endDate) {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (now < start) return 0;
    if (now > end) return 100;
    
    const totalDuration = end - start;
    const elapsed = now - start;
    return Math.round((elapsed / totalDuration) * 100);
}

function deleteTrip(index, event) {
    event.stopPropagation();
    if (!confirm('Are you sure you want to delete this trip?')) return;
    
    const trips = JSON.parse(localStorage.getItem('trips') || '[]');
    trips.splice(index, 1);
    localStorage.setItem('trips', JSON.stringify(trips));
    
    const activeFilter = document.querySelector('.filter-btn.active').dataset.filter;
    loadTrips(activeFilter);
}

function sortTrips(trips, filter) {
    return trips.sort((a, b) => {
        const dateA = new Date(a.startDate);
        const dateB = new Date(b.startDate);
        return filter === 'past' ? dateB - dateA : dateA - dateB;
    });
}

function createTripCard(trip, index) {
    console.log('Creating card for trip:', trip);

    if (!trip.startDate || !trip.endDate) {
        console.error('Trip missing required dates:', trip);
        return '';
    }

    const startDate = new Date(trip.startDate);
    const endDate = new Date(trip.endDate);
    const isPast = new Date() > endDate;
    const status = isPast ? 'Past' : 'Upcoming';
    const statusClass = isPast ? 'past' : 'upcoming';
    const duration = calculateTripDuration(startDate, endDate);
    const progress = isPast ? 100 : calculateTripProgress(startDate, endDate);

    // Safely access trip properties with fallbacks
    const tripName = trip.tripName || 'Unnamed Trip';
    const destination = trip.destination || 'No Destination';
    const activitiesCount = trip.activities ? trip.activities.length : 0;

    return `
        <div class="trip-card ${statusClass}">
            <div class="trip-card-header">
                <h3>${escapeHtml(tripName)}</h3>
                <span class="trip-status ${statusClass}">${status}</span>
            </div>
            <div class="trip-card-content">
                <div class="trip-info">
                    <p><i class="fas fa-map-marker-alt"></i> ${escapeHtml(destination)}</p>
                    <p><i class="fas fa-calendar"></i> ${formatDate(startDate)} - ${formatDate(endDate)}</p>
                    <p><i class="fas fa-clock"></i> ${duration} days</p>
                </div>
                <div class="trip-stats">
                    <p><i class="fas fa-list-ul"></i> ${activitiesCount} Activities</p>
                    ${!isPast ? `
                    <div class="progress-bar">
                        <div class="progress" style="width: ${progress}%"></div>
                    </div>
                    <p class="progress-text">${progress}% Complete</p>
                    ` : ''}
                </div>
            </div>
            <div class="trip-card-actions">
                <button onclick="viewTripDetails(${index})" class="action-btn view">
                    <i class="fas fa-eye"></i> View Details
                </button>
                <button onclick="shareTrip(${index})" class="action-btn share">
                    <i class="fas fa-share-alt"></i> Share
                </button>
                <button onclick="deleteTrip(${index}, event)" class="action-btn delete">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `;
}

function formatDate(date) {
    try {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    } catch (error) {
        console.error('Error formatting date:', error);
        return 'Invalid Date';
    }
}

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function viewTripDetails(index) {
    console.log('Viewing trip details for index:', index);
    const trips = JSON.parse(localStorage.getItem('trips') || '[]');
    
    if (!trips[index]) {
        console.error('Trip not found for index:', index);
        return;
    }

    localStorage.setItem('currentTripIndex', index);
    window.location.href = 'create-trip.html?view=' + index;
}

function shareTrip(index) {
    console.log('Sharing trip at index:', index);
    const trips = JSON.parse(localStorage.getItem('trips') || '[]');
    const trip = trips[index];
    
    if (!trip) {
        console.error('Trip not found for sharing:', index);
        return;
    }

    const shareText = `Check out my trip to ${trip.tripName} in ${trip.destination}!`;
    
    if (navigator.share) {
        navigator.share({
            title: 'Share Trip',
            text: shareText,
            url: window.location.href
        }).catch(error => console.error('Error sharing:', error));
    } else {
        navigator.clipboard.writeText(shareText + ' ' + window.location.href)
            .then(() => alert('Trip details copied to clipboard!'))
            .catch(error => console.error('Error copying to clipboard:', error));
    }
} 