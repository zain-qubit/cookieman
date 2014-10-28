(function() {

  function getPaths(path) {
    path = path.replace(/\/$/, "").split("/");
    // map needs to work in ie
    path = path.map(function(part, index) {
      return path.slice(0, index + 1).join("/") || "/";
    });
    return path;
  }

  function getDomains(domain) {
    domain = domain.split(".");
    var domains = domain.slice(0, domain.length - 1).map(function(part, index) {
      return domain.slice(index, domain.length).join(".");
    });
    return domains.concat(domains.map(function(d) {
      return "." + d;
    })).concat([null]);
  }

  module.exports = {
    get: function(name) {
      return this.cookies().filter(function(val) {
        return val.name === name;
      });
    },
    set: function(name, value, options) {
      var cookie = name + "=" + value + ";";
      options = options || {};

      if (options.expires) {
        cookie += "Expires=" + new Date(1).toUTCString() + ";";
      }
      if (options.path) {
        cookie += "Path=" + options.path + ";";
      }
      if (options.domain) {
        cookie += "Domain=" + options.domain + ";";
      }
      document.cookie = cookie;
    },
    cookies: function() {
      if (!document.cookie) {
        return [];
      }
      return document.cookie.toString().split(";").map(function(cookie) {
        cookie = cookie.split("=");
        return {
          name: cookie[0].trim(),
          value: cookie[1].trim()
        };
      });
    },
    clear: function(name, options) {
      var length = this.cookies().length;
      options = options || {};
      options.expires = new Date(1);
      this.set(name, "", options);
      return this.cookies().length !== length;
    },
    // try deleting on all paths and domains, return the combination that actually works
    clearAll: function(name) {
      var d, p, cleared = [];
      var paths = getPaths(window.location.pathname);
      var domains = getDomains(window.location.hostname);

      // if wasn't deleted return 
      if (!this.clear(name)) {
        return [];
      }
      for (d = 0; d < domains.length; d++) {
        for (p = 0; p < paths.length; p++) {
          // track deleted cookies
          if (this.clear(name, {
            path: paths[p],
            domain: domains[d]
          })) {
            cleared.push({
              domain: domains[d],
              path: paths[p]
            });
          }
        }
      }
      return cleared.length ? cleared : false;
    }
  };

})();