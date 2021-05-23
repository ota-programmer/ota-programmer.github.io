var input = document.getElementById("myfile");
var output = document.getElementById("output");
var web_node = document.getElementById("web_node");

var conn_button = document.getElementById("conn_button");

var upload_button = document.getElementById("upload_button");

var text = null
var connection_status = 'NOT CONNECTED'

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
        text_edited = text.replace(/\n|\r/g, " ");
        var array = text_edited.split(" ");
        var i = 0;
        while (i < array.length) {
            if (array[i] === "") {
                array.splice(i, 1);
            } else {
                ++i;
            }
        }
        console.log("STARTING UPLOAD ....");
        const http = new EasyHTTP;
        http.put('https://ota-programmer-default-rtdb.firebaseio.com/line.json', array)
            .then(data => {
                const code_data = {
                    lines : array.length,
                    new : true
                };

                http.put('https://ota-programmer-default-rtdb.firebaseio.com/code.json', code_data)
                .then(data => {
                    upload_button.className = "fa-spin"
                    alert("Upload Success")
    
                })
                .catch(err => console.log(err));

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
                connection_status = value;
                web_node.textContent = value;
                if (value == "CONNECTED") {
                    web_node.className = "w3-tag w3-green w3-margin-left"
                }
                else if (value == "NOT CONNECTED") {
                    web_node.className = "w3-tag w3-red w3-margin-left"
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
