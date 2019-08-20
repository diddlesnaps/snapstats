import ApolloClient from 'apollo-boost';

const uri = (process.env.NODE_ENV === 'production') ?
    'https://snapstats.org/graphql' :
    'http://localhost:3000/graphql';
export default new ApolloClient({
    uri: uri,
    fetch: __fetch
});
