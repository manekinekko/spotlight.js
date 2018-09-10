(function(window){

    window.Spotlight = {};
    window.Spotlight.enable = function enable() {

        let timer;
        const mouse = { down: false };
        const backdrop = addBackdrop();
    
        backdrop.canvas.addEventListener('mousedown', _ => {
    
            mouse.down = true;
            document.body.style.cursor = 'none';
    
        }, false);
    
        backdrop.canvas.addEventListener('mouseup', _ => {
    
            mouse.down = false;
            window.Spotlight.disabledisable(backdrop);
    
    
        }, false);
    
        backdrop.canvas.addEventListener('mousemove', (mouseEvent) => {
    
            if (mouse.down) {
                const mousePositon = getMousePosition(backdrop.canvas, mouseEvent);
                showSpotlight(backdrop, mousePositon);
            }
            else {
                window.Spotlight.disabledisable(backdrop);
            }
    
    
            window.clearInterval(timer);
            mouse.down = true;
            timer = setTimeout(() => {
                window.Spotlight.disabledisable(backdrop);
            }, 1000);
    
    
        }, false);
    
        window.addEventListener('resize', (resize) => {
    
            const canvas = backdrop.canvas;
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
    
        }, false);
    
    };
    
    function getMousePosition(canvas, evt) {
    
        const rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    }
    
    function showSpotlight(backdrop, mousePositon) {
    
        window.Spotlight.disabledisable(backdrop);
    
        const canvas = backdrop.canvas;
        const context = backdrop.context;
        const spotlightSize = 130;
    
        const mask = document.createElement('canvas');
        mask.width = canvas.width;
        mask.height = canvas.height;
    
        const maskContext = mask.getContext('2d');
        maskContext.fillStyle = '#000000A8';
        maskContext.fillRect(0, 0, mask.width, mask.height);
        maskContext.globalCompositeOperation = 'xor';
    
        maskContext.fillStyle = '#FFFFFFFF';
        maskContext.arc(mousePositon.x, mousePositon.y, spotlightSize, 0, 2 * Math.PI);
        maskContext.fill();
    
        context.drawImage(mask, 0, 0);
    
        document.body.style.cursor = 'none';
    }
    
        window.Spotlight.disable = function disable(backdrop) {
        const canvas = backdrop.canvas;
        const context = backdrop.context;
        context.clearRect(0, 0, canvas.width, canvas.height);
        document.body.style.cursor = 'auto';
    }
    
    function addBackdrop() {
        const container = document.createElement('div');
        container.id = 'spotlight';
        container.style.cssText = 'position:fixed;top:0;left:0;bottom:0;right:0;z-index:99;';
    
        var canvas = document.createElement('canvas');
        var context = canvas.getContext('2d');
    
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    
        container.appendChild(canvas);
        document.body.appendChild(container);
    
        return {
            container,
            canvas,
            context
        }
    }
    
}(window)); 