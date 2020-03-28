/**
 * Import issues Gitlab v4 API
 * 
 */

 
function onOpen() {

    var ui = SpreadsheetApp.getUi();
    // Or DocumentApp or FormApp.
    ui.createMenu('GitLab Issues')
        .addItem('Pull issues', 'pull')
        .addItem('Settings', 'settings')
        .addToUi();
}

function pull() {

    var ui = SpreadsheetApp.getUi();

    var settings = getSettings();

    var milestone = settings.params.milestone && settings.params.milestone !== 'none' 
        ? ` from milestone ${settings.params.milestone}?`
        : '?';
        
    if(settings.options.headers['PRIVATE-TOKEN']) {

        var result = ui.alert(
            `GitLab Import`,
            `Pull ${settings.params.state} issues ${milestone}`,
            ui.ButtonSet.YES_NO
        );
    
        // Process the user's response.
        if (result == ui.Button.YES) {
            run();
        }
    } else {

        var result = ui.alert(
            `GitLab Import`,
            `Please, before pulling, set your access token`,
            ui.ButtonSet.OK
        );
    }

}

function settings() {

    var html = HtmlService.createHtmlOutputFromFile('dialog-settings')
        .setTitle('GitLab Issues - Settings')
        .setWidth(840)
        .setHeight(1200);

    SpreadsheetApp.getUi()
        .showModalDialog(html, 'GitLab Issues Settings');
}

function run() {

    if (getSettings('clearSheet')) {
        clear();
    }

    if (getSettings('createHeaders')) {
        header();
    }

    fetchData();
}

function getRows(entries) {

    for (var i = 0; i < entries.length; i++) {

        var entry = entries[i];
        var row = {};

        for (var c = 0; c < columns.length; c++) {

            var column = columns[c];
            var value = getObjectValue(entry, column.value);

            if (column.pattern) {

                value = findByPatern(column.pattern, value);
            }

            if (column.link) {
                value = `=HIPERLINK("${entry[column.link]}"; "${value}")`;
            }

            if (column.function) {
                value = column.function(value);
            }

            row[column.name] = value;
        }

        setRow(row);
    }
}

function getObjectValue(entry, path) {

    var keys = path.split('.');
    var key = keys[0];

    var value = entry[key];


    if (!value) {
        return '';
    }

    if (keys.length > 1) {

        var next = keys.splice(1).join('.');
        return getObjectValue(value, next);
    }

    return value;
}

function findByPatern(pattern, value) {

    var reg = new RegExp(pattern, 'g');
    var match;
    var arr = [];

    if (Array.isArray(value)) {

        arr = value;
        value = '';

        for (var m = 0; m < arr.length; m++) {

            match = reg.exec(arr[m]);

            if (match && match.length > 0) {

                value = value + ' ' + match[1];
            }
        }

    } else {

        match = reg.exec(value);

        if (match && match.length > 0) {

            value = match[1];
        }
    }

    return value;
}

