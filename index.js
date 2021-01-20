const {google} = require('googleapis');

const keys = require('./keys.json');

const client = new google.auth.JWT(
    keys.client_email, 
    null, 
    keys.private_key,
    ['https://www.googleapis.com/auth/spreadsheets'] 
);


client.authorize(function(err, tokens){
    
    if(err){
        console.log(err);
        return;
    }else{
        console.log('Connected!');
        gsrun(client);
    }
});


async function gsrun(cl){

    const gsapi = google.sheets({version: 'v4', auth: cl});
    const options = {
        spreadsheetId: '1jkqUmWaQ3y8Lz_5f2fXrrGYvbO-PCbha-RsifamcgnM',
        range: 'A4:F27'
    };

    let data = await gsapi.spreadsheets.values.get(options);
    let dataObjects = data.data.values;

    let newDataObjects= dataObjects.map(function(record){ // creating a new variable (let newDataObjects) and using the map function (dataObjects.map) on the data (let dataObjects) to update the new variable with new values
        var average = (parseInt(record[3]) + parseInt(record[4]) + parseInt(record[5]))/30; // getting average of each student's grades
    
        if(record[2]>15){ // checking if the number of absences exceeds 25 percent
            record[6] = "Reprovado por falta";
            record[7] = "0";
            return record;
        }
    
        rounded_average = Math.round(average);// rounding up or down the student's averages
      
        if(rounded_average<5){ // checking if the average is less than 50
            record[6] = "Reprovado por nota";
            record[7]= "0";
        }
        else if(rounded_average>=7){ // checking if the average is more than 70
            record[6] = "Aprovado";
            record[7] = "0";
        }else if(rounded_average>=5 && rounded_average<7){ // checking if the average is more or equal than 50 and less than 70
            record[6] = "Exame Final";
            var naf = 10-rounded_average; // calculating naf
            record[7] = naf;
        }
        
        return record;
        
    }); 

    const updateOptions = {
        spreadsheetId: '1jkqUmWaQ3y8Lz_5f2fXrrGYvbO-PCbha-RsifamcgnM',
        range: 'A4:H27',
        valueInputOption: 'USER_ENTERED',
        resource: {values: newDataObjects}
    };

    let res = await gsapi.spreadsheets.values.update(updateOptions);

}
