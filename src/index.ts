import {readFileSync, readdirSync, writeFileSync} from "fs";
import path from "path";
import XLSX from "xlsx";

const directoryPath = path.join(__dirname, '../subs');
const filenames = readdirSync(directoryPath);
const srts = filenames.filter(x => x.endsWith(".srt"));
const xlsxs = filenames.filter(x => x.endsWith(".xlsx"));

const [_, __, mode]  = Bun.argv;
const LINE_SEPARATOR = "\r\n";
switch (mode) {
    case "--to-xlsx": {
        console.log("Mode: making xlsx");
        const toProcess = srts.filter(y => !xlsxs.includes([...y.split(".").slice(0,-1), "xlsx"].join(".")));
        console.log("Processing:", toProcess);

        for (const filename of toProcess) {
            const srtPath = `${directoryPath}/${filename}`;
            console.log("Reading:", srtPath);
            const lines = readFileSync(`${directoryPath}/${filename}`, {encoding:"utf8"}).split(LINE_SEPARATOR);

            let o;
            let arr = [];
            for (let i=0;i<lines.length;i++) {
                switch (i % 4) {
                    case 1: {
                        // Timestamp
                        o = {t: lines[i]};
                        break;
                    }
                    case 2: {
                        // Line
                        arr.push({...o, w: lines[i]});
                        break;
                    }
                }
            }

            const worksheet = XLSX.utils.json_to_sheet(arr);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Text");
            XLSX.utils.sheet_add_aoa(worksheet, [["Time", "JA", "EN"]], { origin: "A1" });

            const xlsxPath = `${srtPath.slice(0, srtPath.length-3)}xlsx`;
            XLSX.writeFile(workbook, xlsxPath, { compression: true });
        }

        break;
    }
    case "--to-srt": {
        console.log("Mode: making srt");
        const toProcess = xlsxs.filter(y => !srts.includes([...y.split(".").slice(0,-1), "srt"].join(".")));
        console.log("Processing:", toProcess);

        for (const filename of toProcess) {
            const xlsxPath = `${directoryPath}/${filename}`;
            console.log("Reading:", xlsxPath);
            const workbook = XLSX.read(xlsxPath, {type:"file"});
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];

            const arr = XLSX.utils.sheet_to_json(worksheet, {header:1}).slice(1);

            let lines = [];
            for (let i= 0;i < arr.length; i++) {
                const v = arr[i];
                lines.push(`${i+1}${LINE_SEPARATOR}${v[0]}${LINE_SEPARATOR}${v[2]}${LINE_SEPARATOR}`);
            }
            const string = lines.join(LINE_SEPARATOR)+LINE_SEPARATOR;
            const srtPath = `${xlsxPath.slice(0, xlsxPath.length-4)}srt`;
            writeFileSync(srtPath, string);
        }

        break;
    }
    default: {
        throw "Missing arguments, use --to-xlsx or --to-srt"
    }
}








console.log("DONE");
