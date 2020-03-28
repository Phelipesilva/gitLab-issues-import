/**
 * Import XML Feed issues
 * service: Atom
 */


var columns = {
    "id": "id",
    "title": "Title",
    "milestone": "Milestone",
    "author.name": "CreatedBy",
    "assignee.name": "Assignee",
    "due_date": "DueDate",
    "labels.>type:\\s*([A-Za-z0-9]*)": "Type",
    "labels.>stat:\\s*([A-Za-z0-9]*)": "Situation",
    // The last item must be status
    "status": "status",
};

var service = XmlService.getNamespace('http://www.w3.org/2005/Atom');
var host = 'YOUR_HOST';
var project = 'YOUT_PROJECT_PATH';
var url = host + project + 'issues.atom';

var params = {
    feed_token: 'YOUR_TOKEN',
    state: 'all',
    milestone_title: 'YOUR_MILESTONE'
};

function fetchData() {

    if(params.state == 'all') {
      // open issues
      params.state = 'open';
      allPages(params);
      // closed issues
      params.state = 'closed';
      allPages(params);
      
    } else {
    
      allPages(params);
    }
    
    
}


function allPages(params) {
    // first page fetch
    params.page = 1;
    var req = queryString(url, params);
    var res = UrlFetchApp.fetch(req, { followRedirects: false });
    var code = res.getResponseCode();
    
    while (code === 200) {

        var xml = res.getContentText();

        var document = XmlService.parse(xml);
        var root = document.getRootElement();

        var entries = root.getChildren('entry', service);
        if(!entries.length) {
          break;
        }
        
        getRows(entries)

        // fetch next page
        params.page = params.page + 1;
        req = queryString(url, params);
        res = UrlFetchApp.fetch(req, { followRedirects: false });
        code = res.getResponseCode();
    }
}

function getRows(entries) {

    for (var i = 0; i < entries.length; i++) {

        var row = {};

        // Root keys
        var keys = Object.keys(columns);
        for (var j = 0; j < keys.length; j++) {

            var key = keys[j];
            var attr;
            
            if(key === 'status') {
              continue;
            }

            var objKeys = key.split(".");

            // Access object attributes
            if (objKeys.length > 1) {

                var first = objKeys[0];
                attr = entries[i].getChild(first, service);
                attr = getObject(attr, objKeys);

            } else {

                attr = entries[i].getChild(key, service);
            }


            if (attr) {

                var text = attr.getText();
                var value = columns[key];
                row[value] = text;

            } else {

                var value = columns[key];
                row[value] = "";
            }

        }

        row.status = params.state;
        setRow(row);
    }
}

function getObject(element, objKeys) {

    for (var k = 1; k < objKeys.length; k++) {

        var objKey = objKeys[k];
        var pattern = objKey.split('>');

        if (element && pattern.length > 1) {

            pattern = pattern[1];
            element = findByPatern(element, pattern);

        } else if (element) {

            element = element.getChild(objKey, service);
        }

    }

    return element;
}

function findByPatern(element, pattern) {

    var reg = new RegExp(pattern);

    var childrens = element.getChildren('label', service);

    for (var c = 0; c < childrens.length; c++) {

        var children = childrens[c];

        if (children) {

            var txt = children.getText();
            var match = reg.exec(txt);

            if (match) {
                return children;
            }

        }

    }

}

function setRow(data) {

    var values = Object.values(data);
    var sheet = SpreadsheetApp.getActiveSheet();
    var find = findInColumn('A', values[0]);

    if (find === -1) {
        // insert
        sheet.appendRow(values);
    } else {
        // update
        // sheet.deleteRow(find);
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

    var sheet = SpreadsheetApp.getActiveSpreadsheet();
    sheet = sheet.getSheets()[0];
    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    var keys = Object.keys(columns);

    if (header) {

        for (var i = 0; i < keys.length; i++) {
            var column = columns[keys[i]];
            var columnIndex = headers.indexOf(column);
            if (columnIndex > -1) {
                var range = sheet.getRange(rowIndex, columnIndex + 1, 1, 1);
                range.setValue(row[column]);
            }

        }
    }

}

function clear() {
    var sheet = SpreadsheetApp.getActiveSheet();
    for (var i = 20; i > 0; i--) {
        sheet.deleteRow(i);
    }
}

function queryString(url, data) {
    const params = [];
    for (var d in data)
        params.push(encodeURIComponent(d) + '=' + encodeURIComponent(data[d]));
    return url + '?' + params.join('&');
}

function header() {
    var keys = Object.keys(columns);
    var row = [];
    var sheet = SpreadsheetApp.getActiveSheet();

    for (var i = 0; i < keys.length; i++) {
        row.push(columns[keys[i]]);
    }

    sheet.appendRow(row);
}

function run() {
    clear();
    header();
    fetchData();
}
