$(document).ready(function () {
    $('#signup').click(function (e) {
      e.preventDefault();
      const username = $('input[name="username"]').val();
      const password = $('input[name="password"]').val();
      const passwordAgain = $('input[name="password-again"]').val();
  
      if (password !== passwordAgain) {
        alert('Passwords do not match.');
        return; 
      }
  
      $.ajax({
        type: 'POST',
        url: '/signup-completion',
        data: {
          username: username,
          password: password
        },
        success: function (response) {
          if (response.success) {
            alert('Sign up successful!');
            window.location.href='/';
          } else {
            alert('User already exists or an error occurred.');
          }
        },
        error: function (error) {
          console.error('Error:', error);
          alert('An error occurred.');
        }
      });
    });
  });
  