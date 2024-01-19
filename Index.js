import express from "express";
import multer from "multer";
import uuid4  from "uuid4";
import { resolve, join, extname } from "path";
import { readFile } from "fs";

const __dirname = resolve();
const PORT = 3000;
const app = express();
const upload = multer({
    storage: multer.diskStorage({
        filename(req, file, done) {
            const randomID = uuid4();
            const extension = extname(file.originalname);
            const filename = randomID + extension;

            done(null, filename);
        },
        destination(req, file, done) {
            done(null, join(__dirname, "Public", "Images"));
        }
    })
});
const uploadMiddleware = upload.single("image");

app.use(express.static("Public"));
app.use(uploadMiddleware);

// Home page
app.get("/", (req, res) => {
    let path = join(__dirname, "Pages", "Index.html");

    readFile(path, "utf-8", (err, data) => {
        if (err) {
            res.writeHead(500).end("500 Internal Server Error!");

            return;
        } else {
            res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" }).end(data);
        }
    });
});

// Grid Character Result page (Grid Generate by upload).
app.post("/result", (req, res) => {
    if (req.file == null) {
        res.writeHead(400).end("Bad Request!");

        return;
    }

    console.log(req.file);
    console.log(`Grid Size : ${req.body.gridX}x${req.body.gridY}`);

    let template = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Grid Character - Result</title>
        <link rel="stylesheet" href="Index.css">
    </head>
    <body>
        <div id="container">
            <canvas id="scene"></canvas>
            <img id="character-image" style="display: none;" src="Images/${req.file.filename}" alt="Character Image">
            <script>
                const scene = document.getElementById("scene");
                const characterImage = document.getElementById("character-image");
                const ctx = scene.getContext("2d");

                function DrawGrid(x, y, width, height, xSize, ySize, color, thickness) {
                    ctx.save();
                    ctx.beginPath();

                    ctx.lineWidth = thickness;
                    ctx.strokeStyle = color;

                    for (let gx = x; gx <= x + width; gx += xSize) {
                        ctx.moveTo(gx, y);
                        ctx.lineTo(gx, y + height);
                    }

                    for (let gy = y; gy <= y + height; gy += ySize) {
                        ctx.moveTo(x, gy);
                        ctx.lineTo(x + width, gy);
                    }

                    ctx.stroke();
                    ctx.closePath();
                    ctx.restore();
                }

                function LocalScaleAndCenterCharacterImage() {
                    const width = scene.width;
                    const height = scene.height;
                    const imageWidth = characterImage.width;
                    const imageHeight = characterImage.height;
                    const ratioWidth = imageWidth / width;
                    const ratioHeight = imageHeight / height;
                    const ratioAspect = ratioWidth > 1 ? ratioWidth : ratioHeight > 1 ? ratioHeight : 1;
                    const newWidth = imageWidth / ratioAspect;
                    const newHeight = imageHeight / ratioAspect;
                    const offsetX = (width / 2) - (newWidth / 2);
                    const offsetY = (height / 2) - (newHeight / 2);

                    ctx.drawImage(characterImage, offsetX, offsetY, newWidth, newHeight);
                }

                function Main() {
                    scene.width = characterImage.width;
                    scene.height = characterImage.height;
                    xSize = scene.width / ${req.body.gridX};
                    ySize = scene.height / ${req.body.gridY};
                    color = "${req.body.color}";

                    LocalScaleAndCenterCharacterImage();
                    DrawGrid(0, 0, scene.width, scene.height, xSize, ySize, color, 4);
                }

                characterImage.addEventListener("load", e => {
                    Main();
                });
            </script>
        </div>
    </body>
    </html>`;

    res.writeHead(200, { "Content-Type": "text/html" }).end(template);
});

// Choose image file page.
app.get("/upload", (req, res) => {
    let path = join(__dirname, "Pages", "Upload.html");

    readFile(path, "utf-8", (err, data) => {
        if (err) {
            res.writeHead(500).end("500 Internal Server Error!");

            return;
        } else {
            res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" }).end(data);
        }
    });
});

// 404 Error Page.
app.use((req, res) => {
    res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" }).end("<h1>404 Not Found!</h1>");
});

app.listen(PORT, () => {
    console.log(`Server on ${PORT} port!`);
});