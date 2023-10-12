$(document).ready(function () {
  // When the page is loaded:
  const textPostFields = $('#postText');
  const linkPostFields = $('#postUrlBox');

  // Make visible text post fields in the beginning
  textPostFields.show();
  linkPostFields.hide();

  // When dropdown options are changed:
  $('#postType').on('change', function () {
    const selectedValue = $(this).val();

    if (selectedValue === 'text') {
      textPostFields.show();
      linkPostFields.hide();
    } else if (selectedValue === 'link') {
      textPostFields.hide();
      linkPostFields.show();
    } else {
      // Hide for other cases
      textPostFields.hide();
      linkPostFields.hide();
    }

    // If selected dropdown option is changed, clear the text fields
    $('#subredditName').val('');
    $('#postTitle').val('');
    $('#postText-textarea').val('');
    $('#postUrl-input').val('');
  });

  $('#submitLink').on('click', function (event) {
    event.preventDefault(); // Sayfanın yeniden yüklenmesini önlemek için formun varsayılan davranışını engelle

    // Backende gönderilecek veriler
    var subredditName = $('#subredditName').val();
    var postTitle = $('#postTitle').val();
    var postText = $('#postText-textarea').val();
    var postUrl = $('#postUrl-input').val();
    var postType = $('#postType').val();

    var postData = {
      subredditName: subredditName,
      postTitle: postTitle,
      postText: postText,
      postUrl: postUrl,
      postType: postType,
    };

    $.ajax({
      url: $('#postForm').attr('action'), // Formun action değerini kullanarak isteği gönderir
      type: 'POST',
      data: postData, // It will directly post data to the server without declaring content type
      success: function (data) {
        console.log('Server Response:', data);
      },
      error: function (error) {
        console.error('Server Error:', error);
      },
    });
  });
});
