$(document).ready(function () {
  // Sayfa yüklendiğinde
  const textPostFields = $('#textPostFields');
  const linkPostFields = $('#linkPostFields');

  // Başlangıçta sadece metin alanını görünür yap
  textPostFields.show();
  linkPostFields.hide();

  // Dropdown seçimi değiştiğinde
  $('#postType').on('change', function () {
    const selectedValue = $(this).val();

    if (selectedValue === 'text') {
      textPostFields.show();
      linkPostFields.hide();
    } else if (selectedValue === 'link') {
      textPostFields.hide();
      linkPostFields.show();
    } else {
      // Diğer durumlar için gizle
      textPostFields.hide();
      linkPostFields.hide();
    }
  });
});

$(document).ready(function() {
  $('#submitLink').on('click', function() {
    // Göndermek istediğiniz verileri toplayın
    var subredditName = $('#subredditName').val();
    var postTitle = $('#postTitle').val();
    var postText = $('#postText').val();
    var postUrl = $('#postUrl').val();
    var postType = $('#postType').val();

    var postData = {
      subredditName: subredditName,
      postTitle: postTitle,
      postText: postText,
      postUrl: postUrl,
      postType: postType,
    };

    // Sunucuya POST isteği gönderin
    $.ajax({
      url: '/create-post',
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(postData),
      success: function(data) {
        console.log('Sunucu yanıtı:', data);
      },
      error: function(error) {
        console.error('Sunucu hatası:', error);
      },
    });
  });
});






