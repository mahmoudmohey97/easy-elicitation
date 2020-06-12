var mails = [];
$(document).ready(function () {
    $(document).on("click", 'input[type="checkbox"]', function (e) {
        var checkedMail = $(this).parent().children()[1].innerHTML;
        if ($(this).prop("checked") == true) {
            mails.push(checkedMail);
        }
        else if ($(this).prop("checked") == false) {
            const index = mails.indexOf(checkedMail);
            mails.splice(index, 1);
        }
    });
});


function openForm() {
    document.getElementById("myForm").style.display = "block";
}

function closeForm() {
    document.getElementById("myForm").style.display = "none";
}
function invite() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            // document.getElementById("demo").innerHTML = this.responseText;
        }
    };
    var name = document.getElementById("projectName").value;
    var mail = document.getElementById("clientMail").value;

    xhttp.open("GET", "/sendEmail?name=" + name + "&" + "mail=" + mail, true);
    xhttp.send();
    document.getElementById("clientMail").value = "";

}

function getBas() {

    if (document.getElementById("ba-list").childElementCount != 0) {
        return;
    }
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var arr = this.responseText.split(",");
            for (var i = 0; i < arr.length; ++i) {
                var node = document.createElement("DIV");
                node.setAttribute("id", i);
                var subNode1 = document.createElement("INPUT");
                subNode1.setAttribute("type", "checkbox");
                var textnode = document.createElement("label");
                textnode.innerHTML = arr[i];
                node.appendChild(subNode1);
                node.appendChild(textnode);
                document.getElementById("ba-list").appendChild(node);
            }
            var button = document.createElement("button");
            button.setAttribute('type', "button");
            button.setAttribute('onclick', "inviteBas()");
            button.innerHTML = "Invite";
            document.getElementById("ba-list").lastChild.appendChild(button);
        }

    };
    xhttp.open("GET", "/getBasInCompany", true);
    xhttp.send();
}

function inviteBas() {
    var name = document.getElementById("projectName").value;
    if(mails.length != 0 && name){
        $.ajax({
            type: "POST",
            data: { data : mails,
                'name' :name
            },
            url: "/sendEmailToBA",
            success: function () {
                console.log('Successful');
            }
        });
    }        
}