document.addEventListener('DOMContentLoaded', function () {
    var features = document.querySelectorAll('.feature');
    for (var i = 0; i < features.length; i++) {
        features[i].addEventListener('click', function () {
            var featureName = this.getAttribute('data-feature');
            switch (featureName) {
                case 'PostCreation':
                    window.location.href = 'http://127.0.0.1:3000/create-post';
                    break;
                case 'YourPosts':
                    window.location.href = '#';
                    break;
                default:
                    break;
            }
        });
    }
});

