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
        dateFormat: "Y-m-d",
        minDate: "today"
    });

    // Toggle between Create and Join Trip forms
    const createTripBtn = document.getElementById('createTripBtn');
    const joinTripBtn = document.getElementById('joinTripBtn');
    const createTripForm = document.getElementById('createTripForm');
    const joinTripForm = document.getElementById('joinTripForm');

    createTripBtn.addEventListener('click', () => {
        createTripBtn.classList.add('active');
        joinTripBtn.classList.remove('active');
        createTripForm.classList.remove('hidden');
        joinTripForm.classList.add('hidden');
    });

    joinTripBtn.addEventListener('click', () => {
        joinTripBtn.classList.add('active');
        createTripBtn.classList.remove('active');
        joinTripForm.classList.remove('hidden');
        createTripForm.classList.add('hidden');
    });

    // Form submission handling
    const tripForm = document.querySelector('.trip-form');
    tripForm.addEventListener('submit', function(e) {
        e.preventDefault();
        // Add your form submission logic here
        console.log('Form submitted');
    });

    // Optional: Add destination search suggestions
    const destinationInput = document.getElementById('destination');
    destinationInput.addEventListener('input', function() {
        // Add your destination search logic here
        console.log('Searching for:', this.value);
    });
}); 