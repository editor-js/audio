const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');

/**
 * server example class
 */
class ServerExample {
  /**
   *
   * @param {object} param - construtor param object
   * @param {number} param.port - port number
   * @param {string} param.storageDirectory - directory name for storing content
   */
  constructor({ port, storageDirectory }) {
    this.app = express();
    this.app.use(cors());
    this.app.use(bodyParser.raw());

    this.port = port;
    this.storageDirectory = storageDirectory;

    this.upload = multer({
      dest: storageDirectory,
    });

    this.createServerExample();
  }

  /**
   * create example express server for uploading audio and imag files
   */
  createServerExample() {
    this.app.post('/uploadAudio', this.upload.single('file'), (req, res) => {
      try {
        console.log('uploaded file =>', req.file);
      } catch (error) {
        console.error(error);

        res.send({
          success: 0,
          url: null,
        });
      }
    });

    this.app.post('/uploadThumbnail', this.upload.single('file'), (req, res) => {
      try {
        if (req.file) {
          console.log(req.file);

          res.send({
            sucess: 1,
            url: `http://localhost:${this.port}/`,
          });
        } else {
          throw new Error('No file received');
        }
      } catch (error) {
        console.error(error);

        res.send({
          success: 0,
          url: null,
        });
      }
    });

    this.app.listen(this.port, () => {
      console.log(`Example backend listening at http://localhost:${this.port}`);
      console.log(`Uploaded files will be stored at ${this.storageDirectory}`);
    });
  }
}

// eslint-disable-next-line no-new
new ServerExample({
  port: 3000,
  storageDirectory: path.join(__dirname, '/\.tmp'),
});
