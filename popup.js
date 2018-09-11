class SpotlightPopup {
  constructor() {
    this.applicationToggle = document.querySelector('#application-toogle');
    this.spotSizeLabel = document.querySelector('#spot-size-label');
    this.spotSizeInput = document.querySelector('#spot-size-input');
    this.laserSizeLabel = document.querySelector('#laser-size-label');
    this.laserSizeInput = document.querySelector('#laser-size-input');
    this.mouseModeInput = document.querySelector('#mouse-mode');
    this.backdrop = document.querySelector('#backdrop');

    this.appStatus = false;
  }

  async injectScript() {
    await chrome.tabs.executeScript({
      file: 'index.js'
    });
  }

  autoBindLinks() {
    const links = document.getElementsByTagName('a');
    for (let i = 0; i < links.length; i++) {
      (function() {
        const ln = links[i];
        const location = ln.href;
        ln.onclick = _ => chrome.tabs.create({ active: true, url: location });
      })();
    }
  }

  bindSpotType() {
    // set clicked item as selected
    const effectItems = Array.from(
      document.querySelectorAll('section > div.effect-item')
    );
    effectItems.forEach(item => {
      item.addEventListener('click', onItemClick.bind(this)(item));
    });

    function onItemClick(item) {
      return event => {
        // clear currently selected item
        // select the clicked item
        // NOTE: order is important here!
        document
          .querySelector('.effect--selected')
          .classList.remove('effect--selected');
        item.classList.add('effect--selected');

        // show the associated config section
        const spotType = item.getAttribute('data-type');
        Array.from(document.querySelectorAll('[data-config]')).map(section => {
          section.style.cssText = 'display:none';
        });

        // if selected item has a config block, show it
        const spotConfig = document.querySelector(
          `[data-config="${spotType}"]`
        );
        if (spotConfig) {
          spotConfig.style.cssText = 'display:flex';
        }

        chrome.storage.sync.set({ spotType });

        this.sendCommand('spot-type', spotType);
      };
    }
  }

  setSpotTypeFromConfig() {
    chrome.storage.sync.get('spotType', event => {
      if (event.spotType) {
        const typeSpot = document.querySelector(
          `[data-type="${event.spotType}"]`
        );
        if (typeSpot) {
          typeSpot.click();
        }

        if (this.appStatus) {
          this.sendCommand('spot-type', event.spotType);
        }
      }
    });
  }

  bindMouseMode() {
    this.mouseModeInput.onchange = event => {
      chrome.storage.sync.set({ mouseMode: event.target.checked });
      this.sendCommand('mouse-mode', event.target.checked);
    };
  }

  setMouseModeFromConfig() {
    chrome.storage.sync.get('mouseMode', event => {
      if (event.mouseMode) {
        this.mouseModeInput.setAttribute('checked', true);
      } else {
        this.mouseModeInput.removeAttribute('checked');
      }

      this.mouseModeInput.checked = event.mouseMode;
    });
  }

  bindSpotSize() {
    this.spotSizeInput.oninput = event => {
      this.spotSizeLabel.innerHTML = event.target.value;
    };

    this.spotSizeInput.onchange = event => {
      chrome.storage.sync.set({ spotSize: event.target.value });
      this.sendCommand('spot-size', +event.target.value);
    };
  }

  setSpotSizeFromConfig() {
    chrome.storage.sync.get('spotSize', event => {
      if (event.spotSize) {
        this.spotSizeLabel.innerHTML = event.spotSize;
        this.spotSizeInput.value = event.spotSize;

        if (this.appStatus) {
          this.sendCommand('spot-size', +event.spotSize);
        }
      }
    });
  }

  setLaserSizeFromConfig() {
    chrome.storage.sync.get('laserSize', event => {
      if (event.laserSize) {
        this.laserSizeLabel.innerHTML = event.laserSize;
        this.laserSizeInput.value = event.laserSize;

        if (this.appStatus) {
          this.sendCommand('laser-size', +event.laserSize);
        }
      }
    });
  }

  bindLaserSize() {
    this.laserSizeInput.oninput = event => {
      this.laserSizeLabel.innerHTML = event.target.value;
    };

    this.laserSizeInput.onchange = event => {
      chrome.storage.sync.set({ laserSize: event.target.value });
      this.sendCommand('laser-size', +event.target.value);
    };
  }

  bindAppStatus() {
    this.applicationToggle.onchange = change => {
      if (change.target.checked) {
        this.sendCommand('enable');
        this.backdrop.classList.add('application-enabled');
      } else {
        this.sendCommand('disable');
        this.backdrop.classList.remove('application-enabled');
      }

      this.appStatus = change.target.checked;
      chrome.storage.sync.set({ applicationStatus: change.target.checked });
    };
  }

  setAppStatusFromConfig() {
    chrome.storage.sync.get('applicationStatus', event => {
      if (event.applicationStatus) {
        this.applicationToggle.setAttribute('checked', true);
        this.backdrop.classList.add('application-enabled');
        this.sendCommand('enable');
      } else {
        this.applicationToggle.removeAttribute('checked');
        this.backdrop.classList.remove('application-enabled');
        this.sendCommand('disable');
      }

      this.applicationToggle.checked = event.applicationStatus;
      this.appStatus = event.applicationStatus;
    });
  }

  sendCommand(command, value = '') {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      chrome.tabs.sendMessage(
        tabs[0].id,
        {
          command,
          value
        },
        response => {
          console.log('Spotlight.js: %s=%s', command, value);
        }
      );
    });
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const app = new SpotlightPopup();

  app.autoBindLinks();

  app.injectScript();

  app.setAppStatusFromConfig();
  app.bindAppStatus();

  app.setSpotSizeFromConfig();
  app.bindSpotSize();

  app.setLaserSizeFromConfig();
  app.bindLaserSize();

  app.setSpotTypeFromConfig();
  app.bindSpotType();

  app.setMouseModeFromConfig();
  app.bindMouseMode();
});
