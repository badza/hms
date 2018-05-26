var app = app || {};

app.router = function() {    
    var routes = [];
    var mode = null;
    var root = '/';

    var config = function(options) {
        mode = options && options.mode && options.mode == 'history' 
                    && !!(history.pushState) ? 'history' : 'hash';
        root = options && options.root ? '/' + this.clearSlashes(options.root) + '/' : '/';
        return this;
    }

    var getFragment = function() {
        var fragment = '';
        if(mode === 'history') {
            fragment = this.clearSlashes(decodeURI(location.pathname + location.search));
            fragment = fragment.replace(/\?(.*)$/, '');
            fragment = this.root != '/' ? fragment.replace(this.root, '') : fragment;
        } else {
            var match = window.location.href.match(/#(.*)$/);
            fragment = match ? match[1] : '';
        }
        return clearSlashes(fragment);
    }

    var clearSlashes = function(path) {
        return path.toString().replace(/\/$/, '').replace(/^\//, '');
    }

    var add = function(re, handler) {
        if(typeof re == 'function') {
            handler = re;
            re = '';
        }
       
        routes.push({ re: re, handler: handler});
        return this;
    }

    var remove = function(param) {
        for(var i=0, r; i<routes.length, r = routes[i]; i++) {
            if(r.handler === param || r.re.toString() === param.toString()) {
                routes.splice(i, 1); 
                return this;
            }
        }
        return this;
    }

    var flush = function() {
        routes = [];
        mode = null;
        root = '/';
        return this;
    }

    var check = function(f) {
        var fragment = f || getFragment();        
        for(var i=0; i<routes.length; i++) {
            var match = fragment.match(routes[i].re);
            if(match) {
                match.shift();
                routes[i].handler.apply({}, match);               
                return true;
            }           
        }
        return false;
    }

    var listen = function() {
        var interval;
        var self = this;
        var current = getFragment();        
        var fn = function() {
            if(current !== getFragment()) {
                current = getFragment();
                check(current);
            }
        }
        clearInterval(interval);
        interval = setInterval(fn, 50);
        return this;
    }

    var navigate = function(path) {
        path = path ? path : '';
        if(mode === 'history') {
            history.pushState(null, null, this.root + clearSlashes(path));
        } else {
            window.location.href = window.location.href.replace(/#(.*)$/, '') + '#' + path;
        }
        return this;
    }

    return {
        config: config,
        getFragment: getFragment,
        clearSlashes: clearSlashes,
        add: add,
        remove: remove,
        flush: flush,
        check: check,
        listen: listen,
        navigate: navigate
    }
}();