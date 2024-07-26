var express = require('express');
let fs = require('fs');
var path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');

var uygulama = express();
uygulama.use(express.static(path.join(__dirname, 'public')));

// Enable body parsing middleware
uygulama.use(express.json());
uygulama.use(express.urlencoded({ extended: true }));

uygulama.get('/AnaSayfa', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});





uygulama.get('/', (req, res) => {
    res.redirect('/AnaSayfa');
});






uygulama.get('/data', (req, res) => {
    fs.readFile('kisiler.json', 'utf8', (err, data) => {
        if (err) {
            res.status(500).send('Error reading the data file.');
            return;
        }
        

        try {
            res.json(JSON.parse(data));
        } catch (parseError) {
            console.error('Error parsing JSON:', parseError);
            return res.status(500).send('Error parsing JSON');
        }
    });
});


uygulama.post('/change-data', (req, res) => {
    const { bolumid, data } = req.body;
    

    fs.readFile("kisiler.json", 'utf8', (err, fileData) => {
      if (err) {
          console.error('Error reading file:', err);
          return res.status(500).send('Error reading file');
      }

      let jsonData;
      try {
          jsonData = JSON.parse(fileData);
      } catch (parseError) {
          console.error('Error parsing JSON:', parseError);
          return res.status(500).send('Error parsing JSON');
      }

      // Find and update the entry with the same id
      let updated = false;
      jsonData.forEach(item => {
          if (item.id === data) {
              item.bolumid = bolumid;
              updated = true;
              return res.status(200).send("changed data");
          }
          
      });

      if (!updated) {
          return res.status(404).send('Item with the specified id not found');
      }

      // Convert the data back to JSON
      const updatedData = JSON.stringify(jsonData, null, 2); // Indent with 2 spaces

      // Write the updated JSON back to the file
      fs.writeFile("kisiler.json", updatedData, 'utf8', (writeError) => {
          if (writeError) {
              console.error('Error writing file:', writeError);
              return res.status(500).send('Error writing file');
          }
      });
  });

});




uygulama.use(express.static('public'));
uygulama.use(bodyParser.urlencoded({ extended: true }));

uygulama.post('/addCard', (req, res) => {
    const newEntry = {
        name: req.body.name,
        surname: req.body.surname,
        email: req.body.email,
        bolumid:  parseInt(req.body.bolumid, 10)
    };

    fs.readFile('kisiler.json', (err, data) => {
        if (err) throw err;

        let json;
        try {
            json = JSON.parse(data);
        } catch (e) {
            console.error("Error parsing JSON data:", e);
            return res.status(500).send("Error parsing data.json");
        }

        let number = json.length + 1; // Correct spelling of 'length'
        
        const newId = 'drag' + number; // Generate id based on the current length of the array
        newEntry.id = newId;
        json.push(newEntry);

        fs.writeFile('kisiler.json', JSON.stringify(json, null, 2), (err) => {
            if (err) throw err;
            console.log('New entry added');
        });
    });

    res.redirect('/anasayfa');
});


uygulama.post('/delete-data', (req, res) => {
    const { data } = req.body;
    

    fs.readFile("kisiler.json", 'utf8', (err, fileData) => {
      if (err) {
          console.error('Error reading file:', err);
          return res.status(500).send('Error reading file');
      }

      let jsonData;
      try {
          jsonData = JSON.parse(fileData);
      } catch (parseError) {
          console.error('Error parsing JSON:', parseError);
          return res.status(500).send('Error parsing JSON');
      }

      // Find and update the entry with the same id
      let updated = false;
      jsonData.forEach((item,index) => {
          if (item.id === data) {
              jsonData.splice(index,1);
              updated = true;
              return res.status(200).send("deleted");
              
          }
          
      });
      
      if (!updated) {
          return res.status(404).send('Item with the specified id not found');
      }

      // Convert the data back to JSON
      const updatedData = JSON.stringify(jsonData, null, 2); // Indent with 2 spaces
      
      // Write the updated JSON back to the file
      fs.writeFile("kisiler.json", updatedData, 'utf8', (writeError) => {
          if (writeError) {
              console.error('Error writing file:', writeError);
              return res.status(500).send('Error writing file');
          }
      });
      
  });

});






uygulama.get('/check-filled', (req, res) => {
    const filePath = path.join(__dirname, 'detay.json');
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading JSON file');
        }
        const jsonData = JSON.parse(data);
        // Assuming you want to check the `filled` value of the first object in the array
        const filled = jsonData.length > 0 ? jsonData[0].filled : false;
        res.json({ filled });
    });
});

uygulama.get('/change-filled', (req, res) => {
    const filePath = path.join(__dirname, 'detay.json');
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading JSON file');
        }
        const jsonData = JSON.parse(data);
        
        // Toggle the filled value
        jsonData[0].filled = !jsonData[0].filled;

        // Write the updated data back to the file
        fs.writeFile(filePath, JSON.stringify(jsonData, null, 2), 'utf8', (err) => {
            if (err) {
                return res.status(500).send('Error writing JSON file');
            }
            res.send('Filled value updated');
        });
    });
});





let port = 8000;
let ip = "127.0.0.1";

let server = uygulama.listen(port,ip, () => {
    console.log("Server is running on:",ip, port);
});
