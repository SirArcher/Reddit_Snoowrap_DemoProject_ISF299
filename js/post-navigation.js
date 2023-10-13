document.addEventListener('DOMContentLoaded', function () {
    var features = document.querySelectorAll('.feature');
    for (var i = 0; i < features.length; i++) {
        features[i].addEventListener('click', function () {
            var featureName = this.getAttribute('data-feature');
            switch (featureName) {
                case 'YourPosts':
                    window.location.href = '/reddit-posts/your-post';
                    break;
                case 'SubredditHotPosts':
                    window.location.href = '/reddit-posts/subreddit-hot-posts';
                    break;
                default:
                    break;
            }
        });
    }
});

