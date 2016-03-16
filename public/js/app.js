
(function () {
    "use strict";

    var MANET_OPTIONS = [
        'url', 'agent', 'delay', 'format',
        'width', 'height', 'zoom', 'quality',
        'js', 'images',
        'user', 'password',
        'callback', 'headers', 'clipRect',
        'force', 'selector',
        'engine'
    ];

    function cleanBoolValue(name, value) {
        return ((value && (name === 'js' || name === 'images')) ||
                (!value && name === 'force')) ? null : value;
    }

    function readOptions() {
        var options = {};
        MANET_OPTIONS.forEach(function(opt) {
            var element = $('#' + opt),
                value = element.val();

            if (typeof(value) !== 'undefined') {
                if (element.attr('type') === 'checkbox') {
                    value = cleanBoolValue(opt, element.attr('checked'));
                }

                if (value !== null && value !== '') {
                    options[opt] = value;
                }
            }
        });
        return options;
    }

    function generateUrl() {
        return '/?' + $.param(readOptions());
    }

    function updateAddress() {
        $('#address').val(generateUrl());
    }

    $(document).ready(function () {
        MANET_OPTIONS.forEach(function(opt) {
            var element = $('#' + opt);

            element.keyup(updateAddress);
            element.change(updateAddress);
            if (element.attr('type') === 'select') {
                element.select(updateAddress);
            }
        });

        $('#open').click(function(event) {
            window.location = generateUrl();
            event.preventDefault();
        });

        updateAddress();
    });

})();
