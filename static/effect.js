let effects = [effectBubbly, effectConway, effectX, effectOld];
effects[Math.floor(Math.random()*effects.length)]();
function effectBubbly() {
    // This is just conways game of life but it's a bit broken
    const canvas = document.getElementById('effect-container');
    const context = canvas.getContext('2d');

    canvas.width = document.body.clientWidth;
    canvas.height = document.body.clientHeight;

    class Effect {
        constructor() {
            this.backgroundColor = 'rgba(0, 0, 0, 0.1)';
            this.refreshVisuals();
        }

        refreshVisuals() {
            canvas.width = document.body.clientWidth;
            canvas.height = document.body.clientHeight;
            this.gridSize = 16;
            this.width = canvas.width;
            this.height = canvas.height;
            let startingSize = Math.min(this.width, this.height) / this.gridSize;
            this.size = {
                x: this.width / Math.floor(this.width / startingSize),
                y: this.height / Math.floor(this.height / startingSize)
            };
            this.sizeWidth = Math.round(this.width / this.size.x);
            this.palette = {
                r:8 + Math.random()*4,
                g:8 + Math.random()*4,
                b:64 + Math.random()*4
            }

            this.blocks = [];
            for (let j = 0; (j) * this.size.y < (this.height-1); j++) {
                for (let i = 0; (i) * this.size.x < (this.width-1); i++) {
                    this.blocks.push({
                        i: i,
                        j: j,
                        color: {
                            r: Math.floor(this.palette.r + Math.random() * this.palette.r),
                            g: Math.floor(this.palette.g + Math.random() * this.palette.g),
                            b: Math.floor(this.palette.b + Math.random() * this.palette.b)
                        }
                    });
                }
            }

            this.draw(context, true);
        }

        draw(context, skipCheck) {
            for (let x = 0; x < this.blocks.length; x += 1) {
                let block = this.blocks[x];
                let i = block.i, j = block.j;

                if((Math.random() > 0.99) || skipCheck) {
                    context.beginPath();
                    context.fillStyle = "rgba(" + block.color.r + ", " + 
                    block.color.g + ", " + 
                    block.color.b + "," + 
                    1 + ")";
                    context.fillRect(i * this.size.x - 1, j * this.size.y - 1, this.size.x + 2, this.size.y + 2);
                    context.closePath();
                }

            }
        }
    }

    let theEffect = new Effect();

    function looper() {
        theEffect.draw(context);
        requestAnimationFrame(looper);
    }
    looper();

    setTimeout(() => {
        document.getElementById('effect-container').classList.add('fade-in');
        document.getElementById('menu-container').classList.add('fade-in');
    }, 100);

    window.addEventListener('resize', () => {
        if (theEffect) {
            theEffect.refreshVisuals();
        }
    }, false);
}
function effectConway() {
    // This is just conways game of life but it's a bit broken
    const canvas = document.getElementById('effect-container');
    const context = canvas.getContext('2d');

    canvas.width = document.body.clientWidth;
    canvas.height = document.body.clientHeight;

    class Effect {
        constructor() {
            this.backgroundColor = 'rgba(0, 0, 0, 0.1)';
            this.refreshVisuals();
        }

        refreshVisuals() {
            canvas.width = document.body.clientWidth;
            canvas.height = document.body.clientHeight;
            this.gridSize = 12;
            this.width = canvas.width;
            this.height = canvas.height;
            let startingSize = Math.min(this.width, this.height) / this.gridSize;
            this.size = {
                x: this.width / Math.floor(this.width / startingSize),
                y: this.height / Math.floor(this.height / startingSize)
            };
            this.sizeWidth = Math.round(this.width / this.size.x);
            this.palette = {
                r:16 + Math.random()*112,
                g:16 + Math.random()*112,
                b:16 + Math.random()*112
            }
            this.counter = 0;

            this.blocks = [];
            for (let j = 0; (j) * this.size.y < (this.height-1); j++) {
                for (let i = 0; (i) * this.size.x < (this.width-1); i++) {
                    this.blocks.push({
                        i: i,
                        j: j,
                        alive: Math.random() > 0.7 ? true : false
                    });
                }
            }
        }

        draw(context) {
            context.fillStyle = this.backgroundColor;
            context.fillRect(0, 0, this.width, this.height);
            this.counter++;

            if(this.counter>15) {
                this.counter = 0;

                let newAliveStatuses = [];
                for (let x = 0; x < this.blocks.length; x += 1) {
                    let block = this.blocks[x];
                    let neighborCount = 0;
    
                    if (block.i > 0 && x >= this.sizeWidth + 1 && this.blocks[x - this.sizeWidth - 1].alive) {
                        neighborCount++;
                    }
                    if (x >= this.sizeWidth && this.blocks[x - this.sizeWidth].alive) {
                        neighborCount++;
                    }
                    if (block.i < this.sizeWidth-1 && x >= this.sizeWidth - 1 && this.blocks[x - this.sizeWidth + 1].alive) {
                        neighborCount++;
                    }
                    if (block.i > 0 && x >= 1 && this.blocks[x - 1].alive) {
                        neighborCount++;
                    }
                    if (block.i < this.sizeWidth-1 && x < this.blocks.length - 1 && this.blocks[x + 1].alive) {
                        neighborCount++;
                    }
                    if (block.i > 0 && x < this.blocks.length + 1 - this.sizeWidth && this.blocks[x - 1 + this.sizeWidth].alive) {
                        neighborCount++;
                    }
                    if (x < this.blocks.length - this.sizeWidth && this.blocks[x + this.sizeWidth].alive) {
                        neighborCount++;
                    }
                    if (block.i < this.sizeWidth-1 && x < this.blocks.length - 1 - this.sizeWidth && this.blocks[x + 1 + this.sizeWidth].alive) {
                        neighborCount++;
                    }
    
                    // Rules
                    if (block.alive && (neighborCount < 2 || neighborCount > 3)) {
                        newAliveStatuses.push({i:x, alive: false});
                    }
    
                    if (!block.alive && neighborCount == 3) {
                        newAliveStatuses.push({i:x, alive: true});
                    }
                }

                newAliveStatuses.forEach(newAliveStatus => {
                    this.blocks[newAliveStatus.i].alive = newAliveStatus.alive;
                });
            }

            for (let x = 0; x < this.blocks.length; x += 1) {
                let block = this.blocks[x];
                let i = block.i, j = block.j;

                if(!block.color) {
                    block.color = {
                        r: Math.floor(this.palette.r + Math.random() * this.palette.r),
                        g: Math.floor(this.palette.g + Math.random() * this.palette.g),
                        b: Math.floor(this.palette.b + Math.random() * this.palette.b)
                    }
                }

                context.beginPath();
                context.fillStyle = "rgba(" + (block.alive ? block.color.r:block.color.r/2) + ", " + 
                (block.alive ? block.color.g:block.color.g/2) + ", " + 
                (block.alive ? block.color.b:block.color.b/2) + "," + 
                (block.alive ? 0.5:0.1) + ")";
                context.fillRect(i * this.size.x, j * this.size.y, this.size.x, this.size.y);
                context.closePath();
            }
        }
    }

    let theEffect = new Effect();

    function looper() {
        theEffect.draw(context);
        requestAnimationFrame(looper);
    }
    looper();

    setTimeout(() => {
        document.getElementById('effect-container').classList.add('fade-in');
        document.getElementById('menu-container').classList.add('fade-in');
    }, 100);

    window.addEventListener('resize', () => {
        if (theEffect) {
            theEffect.refreshVisuals();
        }
    }, false);
}
function effectX() {
    const canvas = document.getElementById('effect-container');
    const context = canvas.getContext('2d');

    canvas.width = document.body.clientWidth;
    canvas.height = document.body.clientHeight;

    class Effect {
        constructor() {
            this.backgroundColor = 'rgba(0, 0, 84, 0.05)';
            this.centerPoint = { x: -999, y: -999 };
            this.skipSize = 1;
            this.centerDistance = 1;
            this.updateSizes();
        }

        updateSizes() {
            canvas.width = document.body.clientWidth;
            canvas.height = document.body.clientHeight;
            this.width = canvas.width;
            this.height = canvas.height;
            this.gridSize = 16;
            let startingSize = Math.min(this.width, this.height) / this.gridSize;
            this.size = {
                x: this.width / Math.floor(this.width / startingSize),
                y: this.height / Math.floor(this.height / startingSize)
            };
            this.palette = {
                r:16 + Math.random()*112,
                g:16 + Math.random()*112,
                b:16 + Math.random()*112
            }
        }

        draw(context) {
            //context.clearRect(0, 0, this.width, this.height);
            context.fillStyle = this.backgroundColor;
            context.fillRect(0, 0, this.width, this.height);

            if (Math.random() > 0.99) {
                this.centerPoint = { x: Math.floor(Math.random() * (this.width / this.gridSize)), y: Math.floor(Math.random() * (this.height / this.gridSize)) }
                this.centerDistance = 1;
            }
            else if (Math.random() > 0.72) {
                this.centerDistance++;
            }

            if (this.skipSize > 4) {
                this.skipSize = 1;
            }
            else {
                this.skipSize++;
            }

            for (let i = 0; i * this.size.x < this.width; i += this.skipSize) {
                for (let j = 0; j * this.size.y < this.height; j += this.skipSize) {
                    if (Math.random() > 0.999) {
                        context.beginPath();
                        context.fillStyle = "rgba(" + (this.palette.r + Math.random()*this.palette.r) + ", " + 
                            (this.palette.g + Math.random()*this.palette.g) + ", " + 
                            (this.palette.b + Math.random()*this.palette.b) + "," + 
                            "0.2)";
                        context.fillRect(i * this.size.x, j * this.size.y, this.size.x, this.size.y);
                        context.closePath();
                    }

                    if ((Math.abs(i - this.centerPoint.x) == this.centerDistance || Math.abs(j - this.centerPoint.y) == this.centerDistance) && Math.random() > 0.5) {
                        context.beginPath();
                        context.fillStyle = "rgba(" + (this.palette.r + Math.random()*this.palette.r) + ", " + 
                            (this.palette.g + Math.random()*this.palette.g) + ", " + 
                            (this.palette.b + Math.random()*this.palette.b) + "," + 
                            "0.35)";
                        context.fillRect(i * this.size.x, j * this.size.y, this.size.x, this.size.y);
                        context.closePath();
                    }
                }
            }
        }
    }

    let theEffect = new Effect();

    function looper() {
        theEffect.draw(context);
        requestAnimationFrame(looper);
    }
    looper();

    setTimeout(() => {
        document.getElementById('effect-container').classList.add('fade-in');
        document.getElementById('menu-container').classList.add('fade-in');
    }, 100);

    window.addEventListener('resize', () => {
        if (theEffect) {
            theEffect.updateSizes();
        }
    }, false);
}
function effectOld() {
    let sizeMultiplier = 1.5;// This is part of a special feature where the background stretches beyond, if you change the canvas containing object to blockSizeDivider0% height, set this to 2
    let blockSizeDivider = 32;
    let speed = 0.05;
    const canvas = document.getElementById('effect-container');
    const context = canvas.getContext('2d');
    canvas.width = document.body.clientWidth;
    canvas.height = document.body.clientHeight * sizeMultiplier;

    class Grid {
        constructor(backgroundColor) {
            this.backgroundColor = backgroundColor;
            this.xiniti = 0;
            this.yiniti = 0;
            this.blocks = [];
            this.updateSizes();
        }

        updateSizes() {
            canvas.width = document.body.clientWidth;
            canvas.height = document.body.clientHeight * sizeMultiplier;
            this.width = canvas.width;
            this.height = canvas.height;
            this.squareSize = Math.max(this.width, this.height) / blockSizeDivider;
            this.xinitMax = this.squareSize;
            this.yinitMax = this.squareSize;
        }

        draw(context) {
            context.clearRect(0, 0, this.width, this.height);
            context.fillStyle = this.backgroundColor;
            context.fillRect(0, 0, this.width, this.height / sizeMultiplier);
            this.xiniti += speed;
            this.yiniti += speed;

            if (this.xiniti >= blockSizeDivider) {
                this.xiniti = 0;
                for (let i = 0; i < this.blocks.length; i++) {
                    let block = this.blocks[i];
                    block.x--;
                }
            }

            if (this.yiniti >= blockSizeDivider) {
                this.yiniti = 0;
                for (let i = 0; i < this.blocks.length; i++) {
                    let block = this.blocks[i];
                    block.y--;
                }
            }

            this.x = -(this.xinitMax / blockSizeDivider) * this.xiniti + 0;
            this.y = -(this.yinitMax / blockSizeDivider) * this.yiniti + 0;

            if (Math.random() > 0.9 && this.blocks.length < 32) {
                this.blocks.push({
                    state: 'up',
                    a: 0.021,
                    x: Math.round(Math.random() * blockSizeDivider),
                    y: Math.round(Math.random() * (this.height / (this.squareSize) - 2)),
                    sizex: 1 + Math.round(Math.random() * 2),
                    sizey: 1 + Math.round(Math.random() * 2)
                });
            }

            for (let i = 0; i < this.blocks.length; i++) {
                let block = this.blocks[i];

                if (block.state == 'up') {
                    block.a *= 1.2;

                    if (block.a > 1) {
                        block.a = 1;
                        block.state = 'down';
                    }
                }
                else {
                    block.a *= 0.98;
                }

                if (block.a < 0.02) {
                    this.blocks.splice(i, 1);
                    i--;
                    continue;
                }

                context.beginPath();
                context.lineWidth = 1;
                context.fillStyle = "rgba(47, 47, 134," + block.a + ")";
                context.fillRect(this.x + block.x * (this.squareSize), this.y + block.y * (this.squareSize), (this.squareSize) * block.sizex, (this.squareSize) * block.sizey);
                context.closePath();
            }

            /* for (let i = 0; i < blockSizeDivider; i++) {
                var grd = context.createLinearGradient(0, 0, 0, this.height);
                grd.addColorStop(1, "transparent");
                grd.addColorStop(0.1, 'rgba(47,47,134,' + 1 + ')');

                context.beginPath();
                context.moveTo(this.x += (this.squareSize), 0);
                context.lineTo(this.x, this.height);
                context.lineWidth = 2;
                context.strokeStyle = grd;//"#2f2f86";
                context.stroke();
                context.closePath();
            }

            for (let i = 0; i < 999; i++) {
                context.beginPath();
                context.moveTo(0, this.y += (this.squareSize));
                context.lineTo(this.width, this.y);
                context.lineWidth = 2;
                context.strokeStyle = 'rgba(47,47,134,' + (1 - (this.y * 1) / this.height) + ')';//"#2f2f86";
                context.stroke();
                context.closePath();

                if (this.y > this.height) {
                    break;
                }
            } */
        }
    }

    let theGrid = new Grid('rgba(18, 18, 65, 1)');

    function looper() {
        theGrid.draw(context);
        requestAnimationFrame(looper);
    }
    looper();

    setTimeout(() => {
        document.getElementById('effect-container').classList.add('fade-in');
        document.getElementById('menu-container').classList.add('fade-in');
    }, 100);

    window.addEventListener('resize', () => {
        if (theGrid) {
            theGrid.updateSizes();
        }
    }, false);
}