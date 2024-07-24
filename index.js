var express = require('express');
let fs = require('fs');
var path = require('path');
const cors = require('cors');

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
        res.json(JSON.parse(data));
    });
});


uygulama.post('/submit-data', (req, res) => {
    const { bolumid, data } = req.body;
   

    console.log('Received bolumid:', bolumid);
    console.log('Received data:', data);


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

          console.log('File updated successfully.');
          res.send('Data updated successfully');
      });
  });

});




let server = uygulama.listen(3000, () => {
    console.log("Server is running on port 3000");
});
