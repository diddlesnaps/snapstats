import { mergeResolvers } from "merge-graphql-schemas";

import Architecture from "./Architecture";
import Base from "./Base";
import Channel from "./Channel";
import Confinement from "./Confinement";
import DateType from "./Date";
import DeveloperCount from "./DeveloperCount";
import License from "./License";
import SnapCount from "./SnapCount";
import Snaps from "./Snaps";

const resolvers = [
    Architecture,
    Base,
    Channel,
    Confinement,
    DateType,
    DeveloperCount,
    License,
    SnapCount,
    Snaps,
];

export default mergeResolvers(resolvers);