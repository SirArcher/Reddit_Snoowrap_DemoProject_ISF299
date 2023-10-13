$(document).ready(function () {
    $.ajax({
      url: "/your-posts", 
      type: "GET",
      dataType: "json",
      success: function (posts) {
        const postContainer = $("#postContainer");
  
        posts.forEach(function (post) {
          const postElement = $("<div>").addClass("post");
          const postIdElement = $("<div>").addId(post.id);
          const titleElement = $("<h2>").text(post.title);
          const urlElement = $("<a>").href(post.url);
  
          postElement.append(titleElement);
          postElement.append(urlElement);
          postContainer.append(postElement);
          postContainer.append(postIdElement);
        });
      },
      error: function (error) {
        console.error("Gönderileri alma hatası:", error);
      },
    });
  });
  