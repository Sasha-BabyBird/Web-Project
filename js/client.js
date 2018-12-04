$(function() {
    alert($("#example").html())
    $("#example").text(new Date($.now()))
    $.get(
        "http://localhost:8000/things",
        function(data)
        {
            alert('Data loaded: ' + data);
        },
        dataType = "text"
    )
});
