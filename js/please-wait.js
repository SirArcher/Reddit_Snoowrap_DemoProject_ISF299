fetch('/please-wait/process-data', {credentials: 'include'})
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Başarılı kayıt işlemi
            window.location.href = '/userpanel'; // Kullanıcıyı yönlendir
        }
    })
    .catch(error => {
        console.log(error);
        window.location.href = '/error';
    });
