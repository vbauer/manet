
(function () {
    "use strict";

    var MANET_OPTIONS = [
        'url', 'agent', 'delay', 'format',
        'width', 'height', 'zoom',
        'js', 'images',
        'user', 'password',
        'force'
    ];

    function readOptions() {
        var options = {};
        MANET_OPTIONS.forEach(function(opt) {
            var element = $('#' + opt),
                value = element.val();

            if (element.attr('type') === 'checkbox') {
                value = element.attr('checked');
                if ((value && (opt === 'js' || opt === 'images')) || (!value && opt === 'force')) {
                    value = null;
                }
            }

            if (value !== null && value !== '') {
                options[opt] = value;
            }
        });
        return options;
    }

    function generateUrl() {
        return '/' + $.param(readOptions());
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

        $('#open').click(function() {
            window.location = generateUrl();
        });

        updateAddress();
    });

})();
