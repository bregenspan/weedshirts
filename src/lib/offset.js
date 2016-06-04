/**
 * @param {Element} el - element to get position data for
 * @returns {Object} object containing left/right/width/height position data relative to document
 */
function getOffsetPosition(el) {
    var bounds = el.getBoundingClientRect();
    return {
        top: (typeof window.scrollY !== 'undefined' ? window.scrollY : window.pageYOffset) + bounds.top,
        left: (typeof window.scrollX !== 'undefined' ? window.scrollX : window.pageXOffset) + bounds.left,
        width: bounds.width,
        height: bounds.height
    };
}

module.exports = getOffsetPosition;
