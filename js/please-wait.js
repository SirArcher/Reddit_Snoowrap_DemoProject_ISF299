fetch('/please-wait/process-data', {credentials: 'include'})
    .then(response => response.json())
    .then(data => {
        if (data.success === true) {
            window.location.href = '/user-navigation'; 
        }
        else if (data.success === false) {
            window.location.href = '/error'; 
        }
    })
    .catch(error => {
        console.log(error);
        window.location.href = '/error';
    });
