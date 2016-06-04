var data = require('./data.json');

// Clean up data -- we're only interested in marks with descriptions containing
// "The mark consists of", and we don't want the boring stuff at start of mark.

data = data.map(function (row) {

    // Limit to fields we care about, clean up naming
    return {
        description: row.full['Description of Mark'] || '',
        name: row.full['Word Mark'] || '',
        imageFile: row.imageFile,
        owner: row.full.Owner,
        serialNumber: row.full['Serial Number']
    };

}).map(function (row) {
    // Trim out anything before "The mark consists of...", usually it's some
    // boring disclaimer.
    var description = row.description,
        match = description.match(/The mark consists of/i);
    if (match) {
        row.description = description.substr(match.index);
    } else {
        row.description = '';
    }
    return row;
}).map(function (row) {
    // Owner field looks like: [(Applicant)] Name (INDIVIDUAL|CORPORATION|LIMITED LIABILITY COMPANY]) Address
    // We only want the name
    row.owner = row.owner.split(/INDIVIDUAL|CORPORATION|LIMITED|SOLE PRO|PARTNERSHIP|UNINCORPORATED/)[0];
    return row;
}).filter(function (row) {
    // A marijuana shirt trademark is only interesting if it has a description
    return Boolean(row.description);
});

module.exports = data;
