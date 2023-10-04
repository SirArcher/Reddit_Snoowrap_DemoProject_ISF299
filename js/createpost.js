$(document).ready(function () {
  // Sayfa yüklendiğinde
  const textPostFields = $('#postText');
  const linkPostFields = $('#postUrlBox');

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

    // Dropdown seçimi değiştiğinde inputları temizle
    $('#subredditName').val('');
    $('#postTitle').val('');
    $('#postText-textarea').val('');
    $('#postUrl-input').val('');
  });

  let lastResponse = null;
  let delayTimer = null;

  $('#subredditName').on('input', async function () {
    const subredditName = $(this).val().trim();

    if (!subredditName || $('#subredditError').is(':visible')) {
      $('#subredditError').hide();
      return;
    }
    // Daha önce alınan cevap varsa ve subredditName aynıysa, yeni bir istek göndermeyin
    if (lastResponse && lastResponse.subredditName === subredditName) {
      return;
    }
    // Önceki zamanlayıcıyı temizle (eğer varsa)
    if (delayTimer) {
      clearTimeout(delayTimer);
    }
    // Backend API'ye istek gönderir
    // Belirtilen süre kadar gecikmeli bir işlem başlat
    delayTimer = setTimeout(async () => {
      try {
        const response = await fetch(`/api/checkSubredditExistence/${subredditName}`);
        const data = await response.json();
        const subredditExists = data.subredditExists;

        // Hata mesajını gösterip gizleme
        if (!subredditExists) {
          $('#subredditError').show();
        } else {
          $('#subredditError').hide();
        }

        // Son alınan cevabı güncelle
        lastResponse = {
          subredditName,
          subredditExists,
        };
      } catch (error) {
        console.error('API Error:', error);
      }
    }, 1500); // 1,5 saniyelik gecikme
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

    // Sunucuya POST isteği gönder
    $.ajax({
      url: $('#postForm').attr('action'), // Formun action değerini kullanarak isteği gönderir
      type: 'POST',
      data: postData, // Verileri doğrudan gönderir, contentType gerekmez
      success: function (data) {
        console.log('Server Response:', data);
      },
      error: function (error) {
        console.error('Server Error:', error);
      },
    });
  });
});
