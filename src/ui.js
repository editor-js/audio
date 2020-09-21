import HeadphonesIcon from './assets/headphones-icon.svg';
import PauseIcon from './assets/pause-icon.svg';
import PlayIcon from './assets/play-icon.svg';

import Uploader from './uploader.js';

/**
 * class for UI of the tool.
 */
export default class Ui {
  /**
   *
   * @param {object} config - user provided config for tool.
   */
  constructor({ config }) {
    this.config = config;

    this.uploader = new Uploader({
      config,
    });
  }

  /**
   * render the UI of the tool and return its container.
   *
   * @returns {object} - main block wrapper.
   */
  render() {
    return this.createMainBlock();
  }

  /**
   * creates and returns main block.
   *
   * @returns {object} - main block wrapper.
   */
  createMainBlock() {
    const mainBlock = document.createElement('div');

    mainBlock.id = 'main-block';
    mainBlock.classList.add('cdx-block');

    const audioUploadForm = this.createAudioUploadForm();

    mainBlock.appendChild(audioUploadForm);

    return mainBlock;
  }

  /**
   * creates and returns form for uploading audio file.
   *
   * @returns {object} - audio upload form.
   */
  createAudioUploadForm() {
    const audioForm = document.createElement('form');

    audioForm.id = 'audio-form';
    audioForm.enctype = 'multipart/form-data';

    const audioInput = document.createElement('input');

    audioInput.id = 'audio-input';
    audioInput.name = 'audio';
    audioInput.type = 'file';
    audioInput.accept = 'audio/*';
    audioInput.style.display = 'none';

    const audioLabel = document.createElement('label');

    audioLabel.classList.add('cdx-button');
    audioLabel.id = 'audio-uploader-label';
    audioLabel.htmlFor = 'audio-input';

    const headphonesIcon = document.createElement('span');

    headphonesIcon.id = 'headphones-icon';
    headphonesIcon.innerHTML = HeadphonesIcon;

    const audioLabelText = document.createElement('span');

    audioLabelText.id = 'audio-label-text';
    audioLabelText.classList.add('dark-color');
    audioLabelText.textContent = 'Upload Audio';

    audioLabel.appendChild(headphonesIcon);
    audioLabel.appendChild(audioLabelText);

    const uiObj = this;

    audioInput.addEventListener('change', async function () {
      try {
        if (this.files && this.files[0]) {
          const mainBlock = document.getElementById('main-block');

          mainBlock.innerHTML = '';

          const response = await uiObj.uploader.uploadAudio(this.files[0]);

          if (response && response.success == 1) {
            const audioBlock = uiObj.createAudioBlock(response.url);

            mainBlock.appendChild(audioBlock);
          } else {
            throw new Error('Error uploading audio file');
          }
        }
      } catch (error) {
        console.log(error);
      }
    });

    audioForm.appendChild(audioInput);
    audioForm.appendChild(audioLabel);

    return audioForm;
  }

  /**
   * creates and returns the actual audio block after the audio file is uplaoded successfully.
   *
   * @param {string} audioFileURL - URL to the audio file.
   */
  async createAudioBlock(audioFileURL) {
    // eslint-disable-next-line no-undef
    const response = await fetch(audioFileURL);
    const result = await response.json();

    const audioBlock = document.createElement('div');

    audioBlock.id = 'audio-block';

    const thumbnailForm = this.createThumbnailUploadForm();
    const audioMetadata = this.createAudioMetadata(result.audioFile.name);
    const audioController = this.createAudioController(audioFileURL);

    audioBlock.appendChild(thumbnailForm);
    audioBlock.appendChild(audioMetadata);
    audioBlock.appendChild(audioController);

    return audioBlock;
  }

  /**
   * creates and returns form for uplaoding thumbnail images for the audio.
   *
   * @returns {object} - thumbnail upload form.
   */
  createThumbnailUploadForm() {
    const thumbnailForm = document.createElement('form');

    thumbnailForm.id = 'thumbnail-form';
    thumbnailForm.enctype = 'multipart/form-data';

    const thumbnailInput = document.createElement('input');

    thumbnailInput.id = 'thumbnail-input';
    thumbnailInput.name = 'thumbnail';
    thumbnailInput.type = 'file';
    thumbnailInput.accept = 'image/*';
    thumbnailInput.style.display = 'none';

    const thumbnailLabel = document.createElement('label');

    thumbnailLabel.id = 'thumbnail-label';
    thumbnailLabel.htmlFor = 'thumbnail-input';

    const thumbnailUploadIcon = document.createElement('img');

    thumbnailUploadIcon.id = 'thumbnail-upload-icon';
    // thumbnailUploadIcon.src = ThumbnailUploadIcon;

    const thumbnailUploadText = document.createElement('span');

    thumbnailUploadText.id = 'thumbnail-upload-text';
    thumbnailUploadText.textContent = 'Upload cover';

    thumbnailLabel.appendChild(thumbnailUploadIcon);
    thumbnailLabel.appendChild(thumbnailUploadText);

    thumbnailForm.append(thumbnailLabel);
    thumbnailForm.append(thumbnailInput);

    const uiObj = this;

    thumbnailInput.addEventListener('change', async function () {
      if (this.files && this.files[0]) {
        const response = await uiObj.uploader.uploadThumbnail(this.files[0]);

        if (response && response.success == 1) {
          const reader = new FileReader();

          reader.onload = function (event) {
            const thumbnailPreview = document.createElement('img');

            thumbnailPreview.id = 'thumbnail-preview';
            thumbnailPreview.src = event.target.result;

            const thumbnailImageShadow = document.createElement('img');

            thumbnailImageShadow.id = 'thumbnail-image-shadow';
            thumbnailImageShadow.src = event.target.result;

            thumbnailLabel.innerHTML = '';
            thumbnailLabel.appendChild(thumbnailPreview);
            thumbnailLabel.appendChild(thumbnailImageShadow);

            if (document.getElementById('bg-image') != null) {
              document.getElementById('bg-image').src = event.target.result;
            } else {
              const bgImage = document.createElement('img');

              bgImage.id = 'bg-image';
              bgImage.src = event.target.result;

              const mainBlock = document.getElementById('main-block');

              mainBlock.appendChild(bgImage);

              const audioBlock = document.getElementById('audio-block');

              audioBlock.style.backgroundImage = 'none';
              audioBlock.style.backdropFilter = 'blur(5px)';

              document.getElementById('thumbnail-form').classList.add('thumbnail-container');
            }
          };

          reader.readAsDataURL(response.url);
        } else {
          // TODO: throw error as image not uploaded properly.
        }
      }
    });

    return thumbnailForm;
  }

  /**
   * creates and returns editable blocks containing audio file name and its author name.
   *
   * @param {string} audioFileName - name of the audio file provided by the user.
   * @returns {object} - audio metadata wrapper.
   */
  createAudioMetadata(audioFileName) {
    const audioMetadata = document.createElement('div');

    audioMetadata.id = 'audio-metadata';

    const audioFileNameInput = document.createElement('input');

    audioFileNameInput.id = 'audio-file-name';
    audioFileNameInput.placeholder = 'Audio Name';
    audioFileNameInput.value = audioFileName.split('.').slice(0, -1)
      .join('.');
    audioFileNameInput.type = 'text';

    const audioAuthorInput = document.createElement('input');

    audioAuthorInput.id = 'audio-author';
    audioAuthorInput.placeholder = 'Author Name';
    audioAuthorInput.value = 'Unknown';
    audioAuthorInput.type = 'text';

    audioMetadata.appendChild(audioFileNameInput);
    audioMetadata.appendChild(audioAuthorInput);

    return audioMetadata;
  }

  /**
   * creates sand returns UI for playing and stopping the audio.
   *
   * @param {string} audioFileURL - URL to the audio file.
   * @returns {object} - audio controller wrapper.
   */
  createAudioController(audioFileURL) {
    const audioController = document.createElement('div');

    audioController.id = 'audio-controller';

    const playBtn = document.createElement('button');

    playBtn.id = 'audio-play-btn';
    playBtn.classList.add('dark-color');
    playBtn.classList.add('cdx-button');

    const playBtnIcon = document.createElement('span');

    playBtnIcon.id = 'play-btn-icon';
    playBtnIcon.innerHTML = PlayIcon;

    const playBtnText = document.createElement('span');

    playBtnText.id = 'play-btn-text';
    playBtnText.textContent = 'Play';

    playBtn.appendChild(playBtnIcon);
    playBtn.appendChild(playBtnText);

    const pauseBtn = document.createElement('button');

    pauseBtn.id = 'audio-pause-btn';
    pauseBtn.classList.add('dark-color');
    pauseBtn.classList.add('cdx-button');
    pauseBtn.style.display = 'none';

    const pauseBtnIcon = document.createElement('span');

    pauseBtnIcon.id = 'pause-btn-icon';
    pauseBtnIcon.innerHTML = PauseIcon;

    const pauseBtnText = document.createElement('span');

    pauseBtnText.id = 'pause-btn-text';
    pauseBtnText.textContent = 'Pause';

    pauseBtn.appendChild(pauseBtnIcon);
    pauseBtn.appendChild(pauseBtnText);

    audioController.appendChild(playBtn);
    audioController.appendChild(pauseBtn);

    const reader = new FileReader();
    var audio;

    reader.onload = function (event) {
      // eslint-disable-next-line no-undef
      audio = new Audio(event.target.result);
    };

    reader.readAsDataURL(audioFileURL);

    playBtn.addEventListener('click', function () {
      this.style.display = 'none';
      pauseBtn.style.display = 'initial';
      audio.play();
    });

    pauseBtn.addEventListener('click', function () {
      this.style.display = 'none';
      playBtn.style.display = 'initial';
      audio.pause();
    });

    return audioController;
  }
}