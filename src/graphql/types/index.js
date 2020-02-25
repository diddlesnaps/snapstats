import { mergeTypes } from "merge-graphql-schemas";

import { schema as ArchitectureSchema } from "./Architecture";
import { schema as BaseSchema } from "./Base";
import { schema as ChannelSchema } from "./Channel";
import { schema as ConfinementSchema } from "./Confinement";
import { schema as DateTypeSchema } from "./Date";
import { schema as DevelopersSchema } from "./Developers";
import { schema as LicenseSchema } from "./License";
import { schema as PaginationSchema } from "./Pagination";
import { schema as PriceTypeSchema } from "./Price";
import { schema as SnapCountSchema } from "./SnapCount";
import { schema as SnapsSchema } from "./Snaps";

const _typeDefs = [
    ArchitectureSchema,
    BaseSchema,
    ChannelSchema,
    ConfinementSchema,
    DateTypeSchema,
    DevelopersSchema,
    LicenseSchema,
    PaginationSchema,
    PriceTypeSchema,
    SnapCountSchema,
    SnapsSchema,
];

export default mergeTypes(_typeDefs, { all: true });
