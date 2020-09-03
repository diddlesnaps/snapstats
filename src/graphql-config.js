import {MongooseDataloaderFactory} from 'graphql-dataloader-mongoose';

import {connectMongoose} from './mongodb';
import {schema} from "./graphql";

export function getGQLConfig() {
    connectMongoose();
    return {
        schema,
        playground: true,
        introspection: true,
        context: async ctx => {
            let dataloaderFactory = new MongooseDataloaderFactory();
            return { ...ctx, dataloaderFactory };
        },
    };
}
