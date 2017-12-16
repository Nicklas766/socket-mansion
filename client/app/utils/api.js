var axios = require('axios');

function handleError(error) {
    console.warn(error);
    return null;
}

module.exports = {
    fetchUsers: function () {
        console.log("im started /users");
        var encodedURI = window.encodeURI('/api/users');

        return axios.get(encodedURI)
            .then(function (users) {
                return users.data;
            });
    },
    fetchReports: function (id = "") {
        console.log("im started /report");
        var encodedURI = window.encodeURI('/api/report/' + id);

        return axios.get(encodedURI)
            .then(function (reports) {
                return reports.data;
            });
    }
};
