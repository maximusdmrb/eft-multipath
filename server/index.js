import express from "express";
import bodyParser from "body-parser";
import fs from "fs";

import { exec } from "child_process";

const app = express();

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post("/replace", (req, res) => {
  res.status(200).json(req.body);
  const input = req.body.src;
  fs.readdir(input, (err, files) => {
    files.forEach((file) => {
      if (file.includes(".21o")) {
        file = `${input}\\${file}`;
        fs.readFile(file, (err, data) => {
          const re = "UNKNOWN EXT NONE",
            nameAntenna = "ADVNULLANTENNA  ";
          data = data.toString();
          data = data.replace(re, nameAntenna);
          fs.writeFile(file, data, () => console.log("ok"));
        });
      }
    });
  });
});

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

app.post("/obrez", function (req, res, next) {
  res.status(200).json(req.body);
  const input = req.body.src;
  fs.readdir(input, (err, files) => {
    files.forEach((element) => {
      if (element.includes(".txt")) {
        fs.readFile(`${input}\\${element}`, (err, data) => {
          let startGpsStr = data.indexOf("ITRF2014 at Epoch 2010.0");
          let endGpsStr = data.indexOf("Report Information");
          data = data.slice(startGpsStr, endGpsStr);
          fs.writeFile(`${input}\\${element}`, data, () => console.log("ok"));
        });
      }
    });
  });
});

app.listen(80, () => {
  console.log("Сервер запущен");
});
