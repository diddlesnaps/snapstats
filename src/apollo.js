// @ts-check

import ApolloClient from 'apollo-boost';
// import {InMemoryCache} from 'apollo-cache-inmemory';

const uri = (process.env.NODE_ENV === 'production') ?
    'https://snapstats.org/graphql' :
    'http://localhost:3000/graphql';

// let cache;
// if (process.browser === true) {
//     cache = new InMemoryCache({});
//     import('apollo-cache-persist')
//     .then(({default:{persistCache}}) => persistCache({
//         cache,
//         storage: window.localStorage,
//     }));
// }

export default new ApolloClient({
    uri: uri,
    fetch: __fetch,
    // cache,
});
