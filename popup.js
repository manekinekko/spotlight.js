class Spotlight {

    constructor() {
        this.applicationToggle = document.querySelector('#application-toogle');
        this.spotSize = document.querySelector('#spot-size');
        this.spotSizeLabel = document.querySelector('#spotSizeValue');
        this.backdrop = document.querySelector('#backdrop');
    }

    async injectScript() {
        await chrome.tabs.executeScript({
            file: 'index.js'
        });
    }

    bindSpotType() {
        const effectItems = Array.from(document.querySelectorAll('section > div.effect-item'));
        effectItems.forEach(item => {
            item.addEventListener('click', click => {
                // order is important here!
                document.querySelector('.effect--selected').classList.remove('effect--selected');
                item.classList.add('effect--selected');
    
                // show the associated config section
                const type = item.getAttribute('data-type');
                Array.from(document.querySelectorAll('[data-config]')).map(section => {
                    section.style.cssText = 'display:none';
                });
    
                if (type === 'spot') {
                    const typeSpot = document.querySelector('[data-config="spot"]');
                    typeSpot.style.cssText = 'display:flex';
                }
            });
        });
    }

    bindSpotSize() {
        this.spotSize.addEventListener('input', (event) => {
            this.spotSizeLabel.innerHTML = event.target.value;
        }, false);

        this.spotSize.addEventListener('change', (event) =>{
            chrome.storage.sync.set({ 'spot-size': event.target.value });
        }, false);
    }

    bindAppStatus() {
        this.setAppStatusFromConfig();

        this.applicationToggle.addEventListener('change', (change) => {

            if (change.target.checked) {
                this.sendCommand('enable');
                this.backdrop.classList.remove('application-disabled');
            }
            else {
                this.sendCommand('disable');
                this.backdrop.classList.add('application-disabled');             
            }
    
            chrome.storage.sync.set({ 'applicationStatus': change.target.checked });
        });
    }

    setAppStatusFromConfig() {
        chrome.storage.sync.get('applicationStatus', command => {
            debugger;
            if (command.applicationStatus) {
                this.applicationToggle.setAttribute('checked', true);
                this.applicationToggle.checked = true;
                this.backdrop.classList.remove('application-disabled');
            }
            else {
                this.applicationToggle.removeAttribute('checked');
                this.applicationToggle.checked = false;
                this.backdrop.classList.add('application-disabled');
            }
        });
    }

    sendCommand(command) {
        chrome.runtime.sendMessage(command);
    }
}

document.addEventListener('DOMContentLoaded', function () {

    const app = new Spotlight();
    app.injectScript();
    app.bindAppStatus();
    app.bindSpotSize();
    app.bindSpotType();

    // function enable() {
    //     chrome.tabs.query({active: true, currentWindow: true}, async function(tabs) {
    //         await chrome.tabs.executeScript({
    //             file: 'index.js'
    //         });

    //         const app = chrome.runtime.connect(tabs[0].id);
    //         app.postMessage({ command: 'enable' });
    //     });
    // }

    // function disable() {
    //     chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    //         const app = chrome.runtime.connect(tabs[0].id);
    //         app.postMessage({ command: 'disable' });
    //     });
    // }

});