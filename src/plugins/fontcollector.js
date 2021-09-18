const fs = require('fs');
const fontkit = require('fontkit');
const path = require('path');

function parse(callback, folder = '/var/www/amalgam-fansubs.moe/ddl/public/fonts', fontfolder = '/fonts', configlocation = '/var/www/amalgam-fansubs.moe/ddl/public/fonts') {
    const AllFonts = {};
    fs.readdir(folder, (_, files) => {
        files.forEach((file) => {
            const filename = `${folder}/${file}`;
            const match = new RegExp(/\.(woff|svg|ttf|otf|woff2|ttc|dfont)/g);
            if (!match.test(path.extname(filename))) {
                return;
            }
            try {
                const font = fontkit.openSync(filename);
                const fonts = font.fonts ? font.fonts : [font];
                fonts.forEach((singleF) => {
                    if (singleF.fullName) {
                        const name = singleF.name.records.fontFamily ? Object.values(singleF.name.records.fontFamily)[0] : singleF.fullName;
                        // console.log(singleF.name.records.fontFamily);
                        // console.log(font.name)
                        // fullName ??! Araila Bold vs Arial
                        AllFonts[name.toLowerCase()] = `${fontfolder}/${file}`;
                    } else {
                        console.warn('Collection');
                    }
                });
            } catch (e) {
                console.error(e);
            }
        });
        fs.writeFileSync(`${configlocation}/config.json`, JSON.stringify(AllFonts));
        if (callback) {
            callback(AllFonts);
        }
    });
}

parse(
    (res) => {
        console.log(res);
    },
    'C:\\Users\\Totto\\Code2\\TPlayer\\demo\\fonts',
    '/fonts',
    'C:\\Users\\Totto\\Code2\\TPlayer\\demo\\fonts'
);
