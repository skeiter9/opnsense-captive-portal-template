
// jQuery extension for loading multiple scripts
(function($) {
    var cache = [];
    
    $.getMultiScripts = function(arr, path) {
        var _arr = $.map(arr, function(scr) {
            return $.getScript((path || "") + scr);
        });
        
        _arr.push($.Deferred(function(deferred) {
            $(deferred.resolve);
        }));
        
        return $.when.apply($, _arr);
    };
})(jQuery);
