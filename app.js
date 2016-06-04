var express = require('express'),
    compress = require('compression'),
    exphbs = require('express-handlebars'),
    shuffle = require('lodash.shuffle'),
    slash = require('express-slash'),
    data = require('./data'),
    assetRevs = require('./dist/rev-manifest.json'),
    port = process.env.PORT || 3000,
    app, hbs, router, server;

app = express();
hbs = exphbs.create({
	defaultLayout: 'main',
    helpers: {
        asset: function (assetName) {
            return assetRevs[assetName] || assetName;
        }
    }
});

app.enable('strict routing');
app.enable('case sensitive routing');

router = express.Router({
    caseSensitive: app.get('case sensitive routing'),
    strict: app.get('strict routing')
});

app.use(compress());
app.use(express.static('dist', {
    maxAge: 86400000 * 7  // 7 days
}));
app.use(router);
app.use(slash());

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

router.get('/', function (req, res) {
    var item = data[Math.floor(Math.random() * data.length)];
    res.render('home', item);
});

router.get('/poem', function (req, res) {
    res.render('poem', {
        trademarks: shuffle(data).slice(0, 20),
        layout: false
    });
});

router.get(/^\/tm\/([\w\-]+\-)?(\d+)$/, function (req, res) {
    var item = data.filter(function (item) {
        return String(item.serialNumber) === String(req.params[1]);
    });
    if (!item.length) {
        res.status(404).render('404');
        return;
    }
    res.render('home', item[0]);
});

router.get('/*', function (req, res) {
    res.status(404).render('404');
});

server = app.listen(port, function () {
    var host = server.address().address,
        port = server.address().port;
    console.log('App listening at http://%s:%s', host, port);
});

