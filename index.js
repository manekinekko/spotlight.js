window.SpotlightApp = null;

class SpotlightApp {
  constructor() {
    this.spotlightSize = 130;
    this.laserSize = 10;
    this.spotlightTypes = ['spot', 'laser'];
    this.spotlightCurrentTypeIndex = 0;
    this.mousePositions = [];
    this.motionTrailLength = 1;
    this.timer = null;
    this.isMouseMode = false;
  }

  enable() {
    const mouse = { down: false };
    const backdrop = this.addBackdrop();

    backdrop.canvas.onmousedown = backdrop.canvas.touchstart = _ => {
      mouse.down = true;
      this.mousePositions = [];
    };

    backdrop.canvas.onmouseup = backdrop.canvas.touchend = _ => {
      mouse.down = false;
      document.body.style.cursor = 'auto';
      this.clearSpotlight(backdrop);
      this.mousePositions = [];
    };

    backdrop.canvas.onmousemove = backdrop.canvas.touchmove = mouseEvent => {
      if (mouse.down) {
        const mousePositon = this.getMousePosition(backdrop.canvas, mouseEvent);
        this.showSpotlight(backdrop, mousePositon);
        document.body.style.cursor = 'none';
      } else {
        this.clearSpotlight(backdrop);
      }

      if (this.isMouseMode) {
        window.clearInterval(this.timer);
        mouse.down = true;
        this.timer = setTimeout(() => {
          this.clearSpotlight(backdrop);
        }, 2000);
      }
    };

    // cycle though the available type on double click
    backdrop.canvas.ondblclick = _ => {
      this.spotlightCurrentTypeIndex =
        (this.spotlightCurrentTypeIndex + 1) % this.spotlightTypes.length;

      chrome.storage.sync.set({ spotType: this.spotlightCurrentTypeIndex });
    };

    window.addEventListener('resize', this.onResize(backdrop));
  }

  onResize(backdrop) {
    return () => {
      const canvas = backdrop.canvas;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
  }

  getMousePosition(canvas, evt) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
  }

  clearSpotlight(backdrop) {
    const canvas = backdrop.canvas;
    const context = backdrop.context;
    context.clearRect(0, 0, canvas.width, canvas.height);
    document.body.style.cursor = 'auto';
  }

  showSpotlight(backdrop, mousePositon) {
    switch (this.spotlightCurrentTypeIndex) {
      case 1:
        this.drawLaser({ backdrop, mousePositon });
        break;
      case 0:
      default:
        this.drawSpot({ backdrop, mousePositon });
    }
  }

  setSpotType(typeIndex) {
    this.spotlightCurrentTypeIndex = +typeIndex;
  }

  distanceBetween(point1, point2) {
    return Math.sqrt(
      Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2)
    );
  }
  angleBetween(point1, point2) {
    return Math.atan2(point2.x - point1.x, point2.y - point1.y);
  }

  drawLaser({ backdrop, mousePositon }) {
    this.clearSpotlight(backdrop);

    const canvas = backdrop.canvas;
    const context = backdrop.context;

    const mask = document.createElement('canvas');
    mask.width = canvas.width;
    mask.height = canvas.height;

    const maskContext = mask.getContext('2d');

    for (let i = 0; i < this.mousePositions.length; i++) {
      //   const dist = this.distanceBetween(mousePositon, this.mousePositions[i]);
      const angle = this.angleBetween(mousePositon, this.mousePositions[i]);
      // Draw over the whole canvas to create the trail effect
      maskContext.fillStyle = `rgba(255, 255, 255, 0)`;
      maskContext.fillRect(0, 0, canvas.width, canvas.height);

      const x = this.mousePositions[i].x + Math.sin(angle) * i;
      const y = this.mousePositions[i].y + Math.cos(angle) * i;

      // Draw the dot
      const radius = (i + this.laserSize) / this.mousePositions.length;
      maskContext.fillStyle = '#ff0000';
      maskContext.beginPath();
      maskContext.arc(x, y, radius, 0, Math.PI * 2, true);
      maskContext.closePath();
      maskContext.fill();
    }

    this.storeLastMousePosition(mousePositon);

    context.shadowBlur = 10;
    context.shadowColor = `rgba(255, 255, 255, 0)`;
    context.drawImage(mask, 0, 0);
  }

  storeLastMousePosition(mousePositon) {
    // push an item
    this.mousePositions.push(mousePositon);

    // get rid of first item
    if (this.mousePositions.length > this.motionTrailLength) {
      this.mousePositions.shift();
    }
  }

  drawSpot({ backdrop, mousePositon }) {
    this.clearSpotlight(backdrop);

    const canvas = backdrop.canvas;
    const context = backdrop.context;

    const mask = document.createElement('canvas');
    mask.width = canvas.width;
    mask.height = canvas.height;

    const maskContext = mask.getContext('2d');
    maskContext.fillStyle = '#000000A8';
    maskContext.fillRect(0, 0, mask.width, mask.height);
    maskContext.globalCompositeOperation = 'xor';

    maskContext.fillStyle = `rgba(255, 255, 255, 1)`;
    maskContext.arc(
      mousePositon.x,
      mousePositon.y,
      this.spotlightSize,
      0,
      2 * Math.PI
    );
    maskContext.fill();

    context.drawImage(mask, 0, 0);
  }

  disable(backdrop) {
    const container = document.querySelector('#spotlight');
    if (container) {
      container.remove();
    }
    if (backdrop) {
      this.clearSpotlight(backdrop);
      window.SpotlightApp = null;
      backdrop.canvas.onmousedown = null;
      backdrop.canvas.onmouseup = null;
      backdrop.canvas.onmousemove = null;
      window.removeEventListener('resize', this.onResize(backdrop));
    }

    document.body.style.cursor = 'auto';

    chrome.storage.sync.set({ applicationStatus: false });
  }

  addBackdrop() {
    let container = document.querySelector('#spotlight');
    if (container) {
      const canvas = document.querySelector('#spotlight canvas');
      return {
        container,
        canvas,
        context: canvas.getContext('2d')
      };
    } else {
      container = document.createElement('div');
      container.id = 'spotlight';
      container.style.cssText =
        'position:fixed;top:0;left:0;bottom:0;right:0;z-index:1000004;';

      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      container.appendChild(canvas);
      document.body.appendChild(container);

      return {
        container,
        canvas,
        context
      };
    }
  }

  setSpotSize(size) {
    this.spotlightSize = +size;
  }

  setLaserSize(size) {
    this.laserSize = +size;
  }

  setMouseMode(status) {
    this.isMouseMode = status;
  }

  notify(msg) {
    chrome.runtime.sendMessage(msg, response => {
      console.log('Spotlight.js: notified %o.', msg);
    });
  }
}

console.log('Spotlight.js: ready.');
const app = new SpotlightApp();

document.onkeydown = function(evt) {
  evt = evt || window.event;
  if (evt.keyCode === 27) {
    app.disable();
  }
};

chrome.runtime.onMessage.addListener(function(msg) {
  switch (msg.command) {
    case 'enable':
      app.enable();
      break;
    case 'disable':
      app.disable();
      break;
    case 'spot-size':
      app.setSpotSize(msg.value);
      break;
    case 'laser-size':
      app.setLaserSize(msg.value);
      break;
    case 'spot-type':
      app.setSpotType(msg.value);
      break;
    //   TODO
    // case 'spot-color':
    //   app.setSpotColor(msg.value);
    //   console.info('Spotlight.js: set spot color to %s.', msg.value);
    //   break;
    case 'mouse-mode':
      app.setMouseMode(msg.value);
      break;
  }

  console.info('Spotlight.js: %o.', msg);
});
