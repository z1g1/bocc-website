document.addEventListener('DOMContentLoaded', function() {
  let checkinData = JSON.parse(localStorage.getItem('checkinData'));

  function getUrlParameter(name) {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get(name) || '';
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

  if (checkinData) {
      document.getElementById('greeting').innerText = 'Thank you for coming back!';
      document.getElementById('checkinForm').style.display = 'none';
      document.getElementById('greeting').style.display = 'block'; // Show the greeting div

      // Capture the new check-in date
      checkinData.checkinDate = new Date().toISOString();
      console.log(checkinData);

      // Send the checkinData to the API endpoint
      sendCheckinData(checkinData);
  } else {
      document.getElementById('checkinButton').addEventListener('click', function() {
          // Validate required fields
          const name = document.getElementById('name').value;
          const email = document.getElementById('email').value;

          if (!name || !email) {
              alert('Please fill out the required fields.');
              return;
          }

          const checkinDate = new Date().toISOString(); // Capture the date in UTC
          const eventId = document.getElementById('eventId').value; // Get the ID from the hidden input field

          // Capture form values
          const phone = document.getElementById('phone').value;
          const businessName = document.getElementById('businessName').value;
          const okToEmail = document.getElementById('okToEmail').checked;

          // Get URL parameters
          const debug = getUrlParameter('debug'); // 1 or 0 for true or false
          const token = getUrlParameter('token'); // Token string

          // Write all the variables to an array for later usage 
          checkinData = {
              checkinDate: checkinDate,
              eventId: eventId,
              name: name,
              email: email,
              phone: phone,
              businessName: businessName,
              okToEmail: okToEmail,
              debug: debug,
              token: token
          };

          // Store the checkinData in localStorage
          localStorage.setItem('checkinData', JSON.stringify(checkinData));
          
          // Write the checkinData to the console
          console.log(checkinData);

          // Send the checkinData to the API endpoint
          sendCheckinData(checkinData);

          // Display thank you message
          document.getElementById('greeting').innerText = 'Welcome back!';
          document.getElementById('checkinForm').style.display = 'none';
          document.getElementById('greeting').style.display = 'block'; // Show the greeting div
      });
  }
});