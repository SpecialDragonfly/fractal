"use strict";
(function() {
    class Graph {
        constructor(canvasId) {
            this.canvas = document.getElementById(canvasId);
            this.context = this.canvas.getContext("2d");
            this.imageData = this.context.createImageData(this.canvas.width, this.canvas.height);
            this.positionXCoord = document.getElementById("x-coord");
            this.positionYCoord = document.getElementById("y-coord");

            this.aspectRatio = this.canvas.height / this.canvas.width;
            this.zoom = 4; // Assuming co-ordinates go from -2 -> +2
            this.center = {
                // x: -0.7463,
                // y: 0.1102
                x: 0,
                y: 0
            };

            this.displayCoordinates();
            this.canvas.onclick = this.onClick.bind(this);
            this.canvas.ondblclick = this.onDoubleClick.bind(this);
            this.timer = undefined;
        }

        displayCoordinates() {
            this.positionXCoord.innerHTML = this.center.x;
            this.positionYCoord.innerHTML = this.center.y;
        }

        onClick(e) {
            let self = this;
            if (this.timer) clearTimeout(this.timer);
            this.timer = setTimeout(function() {
                let index = self.canvasCoordToImageDataCoord(e.x, e.y);
                let coords = self.indexToCoord(index);
                self.center.x = coords.x;
                self.center.y = coords.y;
                self.displayCoordinates();
                self.render();
            }, 250);
        }

        canvasCoordToImageDataCoord(x, y) {
            return 4 * (y * this.canvas.width + x);
        }

        onDoubleClick(e) {
            clearTimeout(this.timer);
            this.zoom = this.zoom / 2;
            this.render();
        }

        setRenderer(renderer) {
            this.renderer = renderer;
        }

        setZoom(zoom) {
            this.zoom = zoom;
        }

        setCenter(x, y) {
            this.center.x = x;
            this.center.y = y;
        }

        indexToCoord(index) {
            index /= 4;
            let coord =  {
                x: index % this.canvas.width,
                y: Math.floor(index / this.canvas.width)
            };
            coord.x = (coord.x * (this.zoom / this.canvas.width) - (this.zoom / 2) + (this.center.x * this.aspectRatio)) / this.aspectRatio;
            coord.y = ((coord.y * (this.zoom / this.canvas.height) - this.zoom / 2) * -1) + this.center.y;
            return coord;
        }

        render() {
            this.rendering = true;
            for (let i = 0; i < this.canvas.width * this.canvas.height * 4; i += 4) {
                let result = this.renderer(this.indexToCoord(i));
                let set = result.success ? 255 : result.iterations;
                this.imageData.data[i] = set;
                this.imageData.data[i + 1] = 0;
                this.imageData.data[i + 2] = 0;
                this.imageData.data[i + 3] = set;
            }
            this.context.putImageData(this.imageData, 0, 0);
            this.rendering = false;
        }
    }

    class Mandelbrot {
        constructor(iterations) {
            this.iterations = iterations;
        }
        numberValid(initialReal, initialImaginary) {
            let zr = initialReal;
            let zi = initialImaginary;
            for (let i = 0; i < this.iterations; i++) {
                if (zr**2 + zi**2 > 4) {
                    return {'success':false, 'iterations':i};
                }
                let newzr = (zr * zr) - (zi * zi) + initialReal;
                let newzi = ((zr * zi) *2) + initialImaginary;
                zr = newzr;
                zi = newzi;
            }
            return {'success':true, 'iterations':this.iterations};
        }
    }

    let m = new Mandelbrot(200);
    let g = new Graph("ex0");
    g.setZoom(4);
    g.setCenter(0, 0);
    g.setRenderer(function(coord) { return m.numberValid(coord.x, coord.y)});
    g.render();
})();
