const INSTANCE_URL = "https://<INSTANCE_NAME>.my.salesforce.com";
const ACCESS_TOKEN = "<ACCESS_TONEN>";
const QUERY = "SELECT Id FROM ApexLog";
fetch(INSTANCE_URL+'/services/data/v63.0/tooling/query/?q='+QUERY, {
    method: "GET",
    headers: {
        "Authorization": "Bearer "+ACCESS_TOKEN,
        "Accept": "application/json"
    }
})
.then(response => response.json())
.then(data => {
   data.records.forEach(log => {
      fetch(INSTANCE_URL+"/services/data/v63.0/tooling/sobjects/ApexLog/"+log.Id+"/Body", {
          method: "GET",
          headers: {
             "Authorization": "Bearer "+ACCESS_TOKEN,
             "Accept": "text/plain"
           }
      })
      .then(response => response.blob())
      .then(blob => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = log.Id+".log";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
       })
   });
});