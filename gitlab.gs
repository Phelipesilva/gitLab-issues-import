
function getGroups() { 
    var settings = getSettings();
    var url = `${settings.host}/api/v4/groups`;
    var req = queryString(url, {
        min_access_level: 10 // Guest Level
    });
    var res = UrlFetchApp.fetch(req, settings.options);
    var code = res.getResponseCode();
    
    if(code === 200) {
        var data = res.getContentText();
        return {
            items: JSON.parse(data),
            id: 'group_id'
        }
    }
}

function getProjects(groupId=null) {
    var settings = getSettings();
    var url = groupId 
        ? `${settings.host}/api/v4/groups/${groupId}/projects`
        : `${settings.host}/api/v4/projects`;
    var req = queryString(url, {
        min_access_level: 10, // Guest Level
    });
    var res = UrlFetchApp.fetch(req, settings.options);
    var code = res.getResponseCode();
    
    if(code === 200) {
        var data = res.getContentText();
        return {
            items: JSON.parse(data),
            id: 'project_id'
        }
    }
}

function fetchData(startPage = 1) {

    var settings = getSettings();
    var url = settings.projectId 
        ? `${settings.host}/api/v4/projects/${settings.projectId}/issues`
        : `${settings.host}/api/v4/issues`;

    // first page fetch
    settings.params.page = startPage;
    var req = queryString(url, settings.params);
    var res = UrlFetchApp.fetch(req, settings.options);
    var code = res.getResponseCode();

    while (code === 200) {

        var json = res.getContentText();
        var entries = JSON.parse(json);

        if (entries.length == 0) {
            break;
        }

        getRows(entries)

        // fetch next page
        settings.params.page = settings.params.page + 1;
        req = queryString(url, settings.params);
        res = UrlFetchApp.fetch(req, settings.options);
        code = res.getResponseCode();
    }
}