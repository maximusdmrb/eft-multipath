import express from "express";
import bodyParser from "body-parser";
import fs from "fs";

import { exec } from "child_process";

const app = express();

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post("/post", function (req, res, next) {
  res.status(200).json(req.body);
  const input = req.body.src;
  fs.readdir(input, (err, files) => {
    let src = input.split("\\");
    let date = src.pop();
    let url = src.join("\\");
    fs.mkdir(`${url}\\txt`, (err, path) => {
      console.log(err, path);
    });
    setTimeout(() => {
      files.forEach((element) => {
        element.includes(".21o") &&
          exec(
            `${url}\\teqc.exe +qc ${input}\\${element} > ${url}\\txt\\${element}.txt`,
            () => {
              let fileSrc = `${url}\\txt\\${element}.txt`;
              fs.readFile(fileSrc, (err, data) => {
                data = data.slice(data.indexOf("4-character ID"));
                let startGpsStr = data.indexOf("NAVSTAR GPS");
                let endGpsStr = data.indexOf("Rx tracking");
                let part1 = data.slice(0, startGpsStr);
                let part2 = data.slice(
                  endGpsStr,
                  data.indexOf("      first epoch")
                );
                fs.writeFile(fileSrc, part1 + part2, () => console.log("ok"));
              });
            }
          );
      });
    }, 1000);
  });
});

app.listen(3000, () => {
  console.log("Сервер запущен");
});
