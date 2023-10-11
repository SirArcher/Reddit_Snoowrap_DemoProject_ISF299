$(document).ready(function () {
  $('.reddit-button').click(function () {
    $.get('/generate-auth-url', function (data) {
      window.location.href = data.authUrl;
    });
  });
});
$('#username-form').submit(async function (e) {
  e.preventDefault();
  const username = $('#username').val();
  try {
    const response = await $.ajax({
      url: '/generate-auth-url',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({ username }),
      xhrFields: {
        withCredentials: true 
      }
    });
  } catch (error) {
    console.error('Kullanıcı adı kaydetme hatası:', error);
    alert('Kullanıcı adı kaydetme hatası!');
  }
});
