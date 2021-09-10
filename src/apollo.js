import { ApolloClient, HttpLink } from '@apollo/client/core';
import { InMemoryCache } from '@apollo/client/cache';

const uri = (process.env.NODE_ENV === 'production') ?
    'https://snapstats.org/graphql' :
    'http://localhost:5000/graphql';

class Client {
    constructor() {
        if (Client._instance) {
            return Client._instance
        }
        Client._instance = this;

        this.client = this.setupClient();
    }

    setupClient() {
        const link = new HttpLink({
            uri,
            fetch: __fetch,
        });

        const client = new ApolloClient({
            link,
            cache: new InMemoryCache()
        });
        return client;
    }
}

export const client = (new Client()).client;