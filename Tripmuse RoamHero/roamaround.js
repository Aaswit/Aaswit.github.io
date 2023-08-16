function redirectToItinerary(destination) {
    const itineraryUrls = {
        kashmir: 'https://example.com/itinerary/kashmir',
        rajasthan: 'https://example.com/itinerary/rajasthan',
        punjab: 'https://example.com/itinerary/punjab',
        maldives: 'https://example.com/itinerary/maldives',
        paris: 'https://example.com/itinerary/paris',
        usa: 'https://example.com/itinerary/usa',
        england: 'https://example.com/itinerary/england',
        mauritius: 'https://example.com/itinerary/mauritius',
        australia: 'https://example.com/itinerary/australia',
    };

    const url = itineraryUrls[destination];
    if (url) {
        window.location.href = url;
    } else {
        // If the destination is not found in the itineraryUrls object, do nothing or show an error message.
        console.error('Itinerary URL not found for destination:', destination);
    }
}


function showItinerary(event) {
    event.preventDefault();
    const searchInput = document.querySelector('input[name="search"]');
    const enteredWord = searchInput.value;
  
    if (enteredWord.trim() === '') {
      alert('Please enter a word.');
      return false;
    } else {
      const result = `"${enteredWord}" + Itinerary`;
      alert(result);
      window.location.href = `itinerary.html?search=${encodeURIComponent(result)}`;
      return false;
    }
  }


  