$(document).on("click", ".card-body .btn", function(){
  // AJAX POST call to the submit route on the server
  // This will take the data from the form and send it to the server
  var setStatus = false;
  if ($(this).text()=== "Save"){
    setStatus = true;
  }
  var id = $(this).data("id");
  $.ajax("/articles/"+ id, {
    type: "POST",
    data: {
      saved: setStatus
    }
    
  })
});


// Make sure we wait to attach our handlers until the DOM is fully loaded.
