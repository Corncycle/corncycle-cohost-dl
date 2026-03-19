if (!window.define) {
    const modules = {};
    window.__modules = modules;
    const modulePromises = {};

    const thisScriptSource = document.currentScript.getAttribute('src');
    const srcDir = thisScriptSource.substring(0, thisScriptSource.lastIndexOf('/'));

    const load = (id) => {
        if (modules[id]) return modules[id];
        if (modulePromises[id]) return modulePromises[id];
        return modulePromises[id] = new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = srcDir + '/' + id + '.js';
            script.onload = () => modules[id].then(resolve);
            script.onerror = err => reject(new Error('failed to load ' + id));
            script.dataset.id = id;
            document.head.append(script);
        });
    };

    const require = (ids, callback) => {
        Promise.all(ids.map(load)).then(items => {
            if (items.length === 1) callback(items[0]);
            else callback(items);
        });
    };
    window.require = require;

    require.context = (dir, useSubdirs) => {
        if ((dir === "../../images/emoji" || dir === "../images/emoji") && !useSubdirs) {
            const data = {"chunks.png":"f59b84127fa7b6c48b6c.png","eggbug-classic.png":"41454e429d62b5cb7963.png","eggbug.png":"17aa2d48956926005de9.png","sixty.png":"9a6014af31fb1ca65a1f.png","unyeah.png":"5cf84d596a2c422967de.png","yeah.png":"014b0a8cc35206ef151d.png"};
            const f = (n) => data[n];
            f.keys = () => Object.keys(data);
            return f;
        } else if ((dir === "../../images/plus-emoji" || dir === "../images/plus-emoji") && !useSubdirs) {
            const data = {"eggbug-asleep.png":"ebbf360236a95b62bdfc.png","eggbug-devious.png":"c4f3f2c6b9ffb85934e7.png","eggbug-heart-sob.png":"b59709333449a01e3e0a.png","eggbug-nervous.png":"d2753b632211c395538e.png","eggbug-pensive.png":"ae53a8b5de7c919100e6.png","eggbug-pleading.png":"11c5493261064ffa82c0.png","eggbug-relieved.png":"3633c116f0941d94d237.png","eggbug-shocked.png":"b25a9fdf230219087003.png","eggbug-smile-hearts.png":"d7ec7f057e6fb15a94cc.png","eggbug-sob.png":"9559ff8058a895328d76.png","eggbug-tuesday.png":"90058099e741e483208a.png","eggbug-uwu.png":"228d3a13bd5f7796b434.png","eggbug-wink.png":"3bc3a1c5272e2ceb8712.png","host-aww.png":"9bb403f3822c6457baf6.png","host-cry.png":"530f8cf75eac87716702.png","host-evil.png":"cb9a5640d7ef7b361a1a.png","host-frown.png":"99c7fbf98de865cc9726.png","host-joy.png":"53635f5fe850274b1a7d.png","host-love.png":"c45b6d8f9de20f725b98.png","host-nervous.png":"e5d55348f39c65a20148.png","host-plead.png":"fa883e2377fea8945237.png","host-shock.png":"bfa6d6316fd95ae76803.png","host-stare.png":"a09d966cd188c9ebaa4c.png"};
            const f = (n) => data[n];
            f.keys = () => Object.keys(data);
            return f;
        }
        throw new Error('not supported: require.context for ' + dir);
    };

    window.define = (imports, exec) => {
        if (typeof imports === 'function') {
            exec = imports;
            imports = [];
        }
        const id = document.currentScript.dataset.id
            ?? './' + document.currentScript.getAttribute('src').split('/').pop().replace(/\.js$/i, '');
        if (modules[id]) return;
        const exports = {};
        modules[id] = Promise.resolve().then(function() {
            const imported = [];
            for (const id of imports) {
                if (id === 'require') imported.push(Promise.resolve(require));
                else if (id === 'exports') imported.push(Promise.resolve(exports));
                else imported.push(load(id));
            }
            return Promise.all(imported);
        }).then(function(imported) {
            const result = exec.apply(window, imported);
            if (!('default' in exports)) exports.default = result;
            return exports;
        });
    };

    window.process = { env: { NODE_ENV: 'production' } };
}

define(['exports', './post-page', './artist-alley-listing-Dn2_eERZ'], (function (exports, postPage, artistAlleyListing) { 'use strict';

    const ArtistAlleyPaymentSuccessPage = () => {
        postPage.useRequiresLogin();
        const { sessionId } = postPage.useParams();
        const listing = postPage.trpc.artistAlley.getByCheckoutSession.useQuery(
            {
                checkoutSessionId: sessionId,
            },
            {
                suspense: true,
            }
        );

        const theme = postPage.useDynamicTheme();

        return (
            postPage.React.createElement('div', { className: "co-themed-box co-static" , 'data-theme': theme.current,}
                , postPage.React.createElement(postPage.Helmet, { title: "payment success - artist alley"    ,} )
                , postPage.React.createElement('div', { className: "co-prose prose" ,}
                    , postPage.React.createElement('h1', null, "Payment Success" )
                    , postPage.React.createElement('p', null, "we got your payment and your listing is now being reviewed! we'll e-mail you if we have any questions about your listing, or to let you know if it's accepted or rejected."



                    )
                    , postPage.React.createElement('p', null, "here's a preview for the road:"     )
                )
                , postPage.React.createElement('div', { className: "max-w-[300px]",}
                    , listing.data && (
                        postPage.React.createElement(artistAlleyListing.ArtistAlleyListing, {
                            listing: listing.data.listing,
                            project: listing.data.project,}
                        )
                    )
                )
            )
        );
    };

    exports.ArtistAlleyPaymentSuccessPage = ArtistAlleyPaymentSuccessPage;
    exports.default = ArtistAlleyPaymentSuccessPage;

}));
