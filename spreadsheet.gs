function setRow(data) {

    var values = Object.values(data);
    var sheet = SpreadsheetApp.getActiveSheet();
    var find = findInColumn('A', values[0]);

    if (find === -1) {
        // insert
        sheet.appendRow(values);
    } else {
        // update
        updateRow(find, data);
    }

}

function findInColumn(column, data) {

    var sheet = SpreadsheetApp.getActiveSpreadsheet();
    var column = sheet.getRange(column + ":" + column);  // like A:A

    var values = column.getValues();
    var row = 0;

    while (values[row] && values[row][0] !== data) {
        row++;
    }

    if (values[row] && values[row][0] === data)
        return row + 1;
    else
        return -1;
}

function updateRow(rowIndex, row) {

    var sheet = SpreadsheetApp.getActiveSheet();
    var data = sheet.getDataRange().getValues();
    var headers = data[0];

    if (header) {

        for (var i = 0; i < columns.length; i++) {
            var column = columns[i].name;
            var columnIndex = headers.indexOf(column);
            if (columnIndex > -1) {
                var range = sheet.getRange(rowIndex, columnIndex + 1, 1, 1);
                range.setValue(row[column]);

                if (columns[i].link) {
                    range.setFormula(row[column]);
                }
            }

        }
    }

}

function clear() {
    var sheet = SpreadsheetApp.getActiveSheet();

    var start = 1;
    var last = sheet.getLastRow();
    var end = sheet.getLastRow() - start;

    if (last > 0) {

        sheet.deleteRows(start, end + 1);
    }
}

function queryString(url, data = {}) {
    const params = [];
    for (var d in data)
        params.push(encodeURIComponent(d) + '=' + encodeURIComponent(data[d]));
    return url + '?' + params.join('&');
}

function header() {
    var row = [];
    var sheet = SpreadsheetApp.getActiveSheet();

    for (var i = 0; i < columns.length; i++) {
        row.push(columns[i].name);
    }

    sheet.appendRow(row);
}