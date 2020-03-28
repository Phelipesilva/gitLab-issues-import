
var columns = [
    {
        name: "id",
        value: "iid",
    },
    {
        name: "url",
        value: "web_url",
    },
    {
        name: "Title",
        value: "title",
    },
    {
        name: "Milestone",
        value: "milestone.title",
    },
    {
        name: "Created by",
        value: "author.name",
    },
    {
        name: "Assignee",
        value: "assignee.name",
    },
    {
        name: "Created at",
        value: "created_at",
        function: function (created_at) {
            if (created_at) {
                var d = new Date(created_at);
                return d.toLocaleDateString();
            }
            return '';
        }
    },
    {
        name: "Due date",
        value: "due_date",
    },
    {
        name: "Closed at",
        value: "closed_at",
        function: function (closed_at) {
            if (closed_at) {
                var d = new Date(closed_at);
                return d.toLocaleDateString();
            }
            return '';
        }
    },
    {
        name: "Estimate",
        value: "time_stats.human_time_estimate"
    },
    {
        name: "Spent",
        value: "time_stats.human_total_time_spent"
    },
    {
        name: "Progress (%)",
        value: "time_stats",
        function: function (time) {
            if (time.time_estimate) {
                var rate = (time.total_time_spent / time.time_estimate).toFixed(2);
                return Number.parseFloat(rate) * 100;
            }
            return 0;
        }
    },
    {
        name: "Status",
        value: "state",
    }
]

function getSettings(key = false) {

    var cache = CacheService.getScriptCache();
    var settings = cache.get('GitLabIssues');

    if (!settings) {
        settings = {
            createHeaders: true,
            clearSheet: true,
            columns: columns,
            host: 'https://gitlab.com',
            projectId: '',
            groupId: '',
            options: {
                headers: {
                    'PRIVATE-TOKEN': '',
                }
            },
            params: {
                state: 'all',
                milestone: ''
            }
        }
    } else {

        settings = JSON.parse(settings);
    }

    if (key && settings) {
        return settings[key];
    }

    return settings;

}

function setSettings(value, key = false, cb = false) {

    var cache = CacheService.getScriptCache();
    var settings = this.getSettings();

    if (key && settings) {

        settings[key] = value;

    } else {

        settings = {...settings, ...value};
    }

    cache.put('GitLabIssues', JSON.stringify(settings));

    if(cb) {
        cb(settings);
    }

    return settings;
}

function restore() {
    var cache = CacheService.getScriptCache();
    cache.remove('GitLabIssues');
    return this.getSettings();
}