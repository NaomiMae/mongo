$(".card").on("click", ".btn", function() {
  // AJAX POST call to the submit route on the server
  // This will take the data from the form and send it to the server
  var id = $(this).data("_id");
  $.ajax("/articles/"+ id, {
    type: "PUT",
    data: {
      saved: true
    }
    
  })
});