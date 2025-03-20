document.addEventListener('DOMContentLoaded', function() {
  let checkinData = JSON.parse(localStorage.getItem('checkinData'));

  function getUrlParameter(name) {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get(name) || '';
  }

  function captureCheckinData() {
      const debug = getUrlParameter('debug'); // 1 or 0 for true or false
      const token = getUrlParameter('token'); // Token string
      const eventId = getUrlParameter('eventId') || document.getElementById('eventId').value; // Event ID from URL or hidden input
      const checkinDate = new Date().toISOString(); // Capture the date in UTC

      // Use FormData to get all form values
      const form = document.getElementById('checkinForm');
      const formData = new FormData(form);
      const formValues = Object.fromEntries(formData.entries());

      // Combine all data into a single object
      const checkinData = {
          checkinDate: checkinDate,
          eventId: eventId,
          debug: debug,
          token: token,
          ...formValues,
          okToEmail: formData.get('okToEmail') === 'on' // Convert checkbox value to boolean
      };

      console.log('Captured checkinData:', checkinData);
      return checkinData;
  }

  function sendCheckinData(data) {
      console.log('Sending checkinData to the API endpoint...');
      fetch('https://bocc-backend.netlify.app/.netlify/functions/checkin', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
      })
      .then(response => response.json())
      .then(data => {
          console.log('Success:', data);
      })
      .catch((error) => {
          console.error('Error:', error);
      });
  }

  const localOnly = getUrlParameter('local'); // 1 to skip API call

  if (checkinData) {
      // Update checkinData with new values
      checkinData = { ...checkinData, ...captureCheckinData() };

      document.getElementById('greeting').innerText = 'Welcome back!';
      document.getElementById('checkinHeader').innerText = 'Thank you!';
      document.getElementById('checkinForm').style.display = 'none';
      document.getElementById('greeting').style.display = 'block'; // Show the greeting div

      // Store the updated checkinData in localStorage
      localStorage.setItem('checkinData', JSON.stringify(checkinData));

      // Send the checkinData to the API endpoint if localOnly is not set to 1
      if (localOnly !== '1') {
          sendCheckinData(checkinData);
      }
  } else {
      document.getElementById('checkinButton').addEventListener('click', function() {
          // Validate required fields
          const form = document.getElementById('checkinForm');
          const formData = new FormData(form);
          const name = formData.get('name');
          const email = formData.get('email');

          if (!name || !email) {
              alert('Please fill out the required fields.');
              return;
          }

          // Capture new checkinData
          checkinData = captureCheckinData();

          // Store the checkinData in localStorage
          localStorage.setItem('checkinData', JSON.stringify(checkinData));
          
          // Write the checkinData to the console
          console.log(checkinData);

          // Send the checkinData to the API endpoint if localOnly is not set to 1
          if (localOnly !== '1') {
              sendCheckinData(checkinData);
          }

          // Display thank you message
          document.getElementById('checkinHeader').innerText = 'Thank you!';
          document.getElementById('greeting').innerText = 'Thank you for registering!';
          document.getElementById('checkinForm').style.display = 'none';
          document.getElementById('greeting').style.display = 'block'; // Show the greeting div
      });
  }
});