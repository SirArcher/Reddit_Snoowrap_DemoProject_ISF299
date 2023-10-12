$(document).ready(function () {
    let lastResponse = null;
    let delayTimer = null;

    $('#subredditName').on('input', async function () {
        const subredditName = $(this).val().trim();

        if (!subredditName || $('#subredditError').is(':visible')) {
            $('#subredditError').hide();
            return;
        }
        // If last response and subreddit name is same do not send a new request
        if (lastResponse && lastResponse.subredditName === subredditName) {
            return;
        }
        // Clean the previous timer if there is one
        if (delayTimer) {
            clearTimeout(delayTimer);
        }

        delayTimer = setTimeout(async () => {
            try {
                const response = await fetch(`/checkSubredditExistence/${subredditName}`);
                const data = await response.json();
                const subredditExists = data.subredditExists;

                // Show and hide the error message
                if (!subredditExists) {
                    $('#subredditError').show();
                } else {
                    $('#subredditError').hide();
                }

                // Update the last response
                lastResponse = {
                    subredditName,
                    subredditExists,
                };
            } catch (error) {
                console.error('API Error:', error);
            }
        }, 1000); // 1 second delay
    });
});