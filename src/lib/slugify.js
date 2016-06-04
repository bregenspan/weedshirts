/**
 * Given a string, convert it to a URL slug up to 60 characters in length
 */
function slugify(str, maxLength) {
    maxLength = maxLength || 60;
    return str
        .toLowerCase()
        .replace(/[^\w ]+/g, '')
        .replace(/ +/g, '-')
        .substr(0, maxLength)
        .replace(/\-$/, '');
}

module.exports = slugify;
