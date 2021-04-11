var input = document.getElementById("myfile");
var output = document.getElementById("output");
var web_node = document.getElementById("web_node");
var stm_node = document.getElementById("stm_node");
var status_element = document.getElementById("status_element");

var conn_button = document.getElementById("conn_button");
var comm_button = document.getElementById("comm_button");
var all_button = document.getElementById("all_button");
var upload_button = document.getElementById("upload_button");

var text = null
var connection_status = 'NOT CONNECTED'
var communication_status = 'NOT CONNECTED'
input.addEventListener("change", function () {
    if (this.files && this.files[0]) {
        var myFile = this.files[0];
        var reader = new FileReader();

        reader.addEventListener('load', function (e) {
            text = e.target.result;
            output.textContent = text;
            console.log("FILE READ SUCCESS")

        });

        reader.readAsBinaryString(myFile);
    }
});

function upload() {
    
    if (text != null) {
        upload_button.className = "fa fa-spinner fa-spin";
        text_edited = text.replace(/\n|\r/g, "");
        console.log("STARTING UPLOAD ....");
        const http = new EasyHTTP;
        const data = {
            hex: text_edited,
            new: 'true'
        }
        http.put('https://ota-programmer-default-rtdb.firebaseio.com/hex.json', data)
            .then(data => {
                upload_button.className = "fa-spin"
                alert ("Upload Success")
            })
            .catch(err => console.log(err));
    }
    else {
        alert("Please choose file to upload");
    }
}
async function testConnection() {
    conn_button.className = "fa fa-spinner fa-spin"
    test("https://ota-programmer-default-rtdb.firebaseio.com/connection.json").then(
        () => {
            conn_button.className = "fa-spin"
        }
    )
}
function testCommunication() {
    comm_button.className = "fa fa-spinner fa-spin"
    test("https://ota-programmer-default-rtdb.firebaseio.com/communication.json").then(
        () => {
            comm_button.className = "fa-spin"
        }
    )
}
async function testAll() {
    all_button.className = "fa fa-spinner fa-spin"
    test("https://ota-programmer-default-rtdb.firebaseio.com/connection.json").then(
        () => {
            test("https://ota-programmer-default-rtdb.firebaseio.com/communication.json").then(
                () => {
                    all_button.className = "fa-spin"
                }
            )
        }
    );
    
}

function test(url) {
    var result = null;
    const http = new EasyHTTP;
    const data = {
        status: 'NOT CONNECTED',
    }
    return new Promise(resolve => {
        console.log("TESTING .......");
        http.put(url, data)
            .then(data => testSent(url).then((value) => {
                if (url.includes("connection")) {
                    connection_status = value;
                    web_node.textContent = value;
                    if (value == "CONNECTED") {
                        web_node.className = "w3-tag w3-green w3-margin-left"
                    }
                    else if (value == "NOT CONNECTED") {
                        web_node.className = "w3-tag w3-red w3-margin-left"
                    }
                }
                else if (url.includes("communication")) {
                    communication_status = value;
                    stm_node.textContent = value;
                    web_node.textContent = value;
                    if (value == "CONNECTED") {
                        connection_status = value;
                        status_element.textContent = "READY TO FLASH"
                        status_element.className = "w3-tag w3-green w3-margin-left"
                        stm_node.className = "w3-tag w3-green w3-margin-left"
                        web_node.className = "w3-tag w3-green w3-margin-left"
                    }
                    else if (value == "NOT CONNECTED") {
                        status_element.textContent = "NOT READY TO FLASH"
                        stm_node.className = "w3-tag w3-red w3-margin-left"
                        status_element.className = "w3-tag w3-red w3-margin-left"
                    }
                }
                resolve(data);
            }
            ))
            .catch(err => console.log(err));
        });

}

function testSent(url) {
    var result = null
    return new Promise(resolve => {
        setTimeout(() => {
            fetch(url)
                .then(function (response) {
                    return response.json();
                })
                .then(function (myJson) {
                    result = myJson.status;
                    console.log(result)
                    resolve(result);
                })
                .catch(function (error) {
                    console.log("Error: " + error);
                });

        }, 5000);
    });
}


class EasyHTTP {
    async put(url, data) {
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        const resData = await response.json();
        return resData;
    }
}
