
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


var currentTab = 0; // Current tab is set to be the first tab (0)
showTab(currentTab); // Display the current tab

function showTab(n) {
  // This function will display the specified tab of the form...
  var x = document.getElementsByClassName("tab");
  x[n].style.display = "block";
  //... and fix the Previous/Next buttons:
  if (n == 0) {
    document.getElementById("prevBtn").style.display = "none";
  } else {
    document.getElementById("prevBtn").style.display = "inline";
  }
  if (n == (x.length - 1)) {
    document.getElementById("nextBtn").innerHTML = "Submit";
  } else {
    document.getElementById("nextBtn").innerHTML = "Next";
  }
  //... and run a function that will display the correct step indicator:
  fixStepIndicator(n)
}

function nextPrev(n) {



  //create project

  var name = document.getElementById("projectName").value;
  if (currentTab === 0 && name) {
    $.ajax({
      async: false,
      type: "POST",
      data: {
        'name': name
      },
      url: "/createProject",
      success: function (data, status, xhr) {
        document.getElementById("modal-header").innerHTML = "Invite Client";

        // This function will figure out which tab to display
        var x = document.getElementsByClassName("tab");
        // Exit the function if any field in the current tab is invalid:
        if (n == 1 && !validateForm()) return false;
        // Hide the current tab:
        x[currentTab].style.display = "none";
        // Increase or decrease the current tab by 1:
        currentTab = currentTab + n;
        // if you have reached the end of the form...
        if (currentTab >= x.length) {
          // ... the form gets submitted:
          document.getElementById("regForm").submit();
          return false;
        }
        // Otherwise, display the correct tab:
        showTab(currentTab);

      },
      error: function (jqXhr, textStatus, errorMessage) {
        alert('Already exists')
      }
    });
  }


  else if (currentTab === 1) {

    document.getElementById("modal-header").innerHTML = "Invite BA";
    getBas();


    // This function will figure out which tab to display
    var x = document.getElementsByClassName("tab");
    // Exit the function if any field in the current tab is invalid:
    if (n == 1 && !validateForm()) return false;
    // Hide the current tab:
    x[currentTab].style.display = "none";
    // Increase or decrease the current tab by 1:
    currentTab = currentTab + n;
    // if you have reached the end of the form...
    if (currentTab >= x.length) {
      // ... the form gets submitted:
      document.getElementById("regForm").submit();
      return false;
    }
    // Otherwise, display the correct tab:
    showTab(currentTab);
  }

  else {
    document.getElementById("modal-header").innerHTML = "Creating...";
    document.getElementById("nextBtn").style = "display: none";

    // This function will figure out which tab to display
    var x = document.getElementsByClassName("tab");
    // Exit the function if any field in the current tab is invalid:
    if (n == 1 && !validateForm()) return false;
    // Hide the current tab:
    x[currentTab].style.display = "none";
    // Increase or decrease the current tab by 1:
    currentTab = currentTab + n;
    // if you have reached the end of the form...
    if (currentTab >= x.length) {
      // ... the form gets submitted:
      document.getElementById("regForm").submit();
      return false;
    }
    // Otherwise, display the correct tab:
    showTab(currentTab);


  }



}

function validateForm() {
  // This function deals with validation of the form fields
  var x, y, i, valid = true;
  x = document.getElementsByClassName("tab");
  y = x[currentTab].getElementsByTagName("input");

  // A loop that checks every input field in the current tab:
  for (i = 0; i < y.length; i++) {
    // If a field is empty...
    if (y[i].value == "") {
      // add an "invalid" class to the field:
      y[i].className += " invalid";
      // and set the current valid status to false
      valid = false;
    }
  }
  if (currentTab == 1 || currentTab == 2) {
    valid = true;
  }
  // If the valid status is true, mark the step as finished and valid:
  if (valid) {
    document.getElementsByClassName("step")[currentTab].className += " finish";
  }
  return valid; // return the valid status
}

function fixStepIndicator(n) {
  // This function removes the "active" class of all steps...
  var i, x = document.getElementsByClassName("step");
  for (i = 0; i < x.length; i++) {
    x[i].className = x[i].className.replace(" active", "");
  }
  //... and adds the "active" class on the current step:
  x[n].className += " active";
}

function inviteClient() {

  var name = document.getElementById("projectName").value;
  var cEmail = document.getElementById("clientEmail").value;
  if (!cEmail) {
    alert("empty");
    return;
  }
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
    }
  };
  xhttp.open("GET", "/sendEmail?name=" + name + "&" + "mail=" + cEmail, true);
  xhttp.send();
  document.getElementById("clientEmail").value = "";
}



function getBas() {

  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      var arr = this.responseText.split(",");
      for (var i = 0; i < arr.length - 1; ++i) {
        var node = document.createElement("DIV");
        node.setAttribute("id", i);
        var subNode1 = document.createElement("INPUT");
        subNode1.setAttribute("type", "checkbox");
        subNode1.setAttribute("style", "margin-right: 5px;");
        var textnode = document.createElement("label");
        textnode.innerHTML = arr[i];
        node.appendChild(subNode1);
        node.appendChild(textnode);
        document.getElementById("ba-list").appendChild(node);
      }


      document.getElementById("nextBtn").setAttribute('onclick', "inviteBas()");

      // var button = document.createElement("button");
      // button.setAttribute('type', "button");
      // button.setAttribute('onclick', "inviteBas()");
      // button.setAttribute("style", "float:left ;");
      // button.innerHTML = "Invite";
      // document.getElementById("ba-list").appendChild(button);
    }

  };
  xhttp.open("GET", "/getBasInCompany", true);
  xhttp.send();
}


function inviteBas() {
  var name = document.getElementById("projectName").value;
  if (mails.length != 0 && name) {
    $.ajax({
      type: "POST",
      data: {
        data: mails,
        'name': name
      },
      url: "/sendEmailToBA",
      success: function () {

        nextPrev(1);
        
      }
    });
  }
  else
  {
    nextPrev(1);
  }
}