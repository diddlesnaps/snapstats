import { LastUpdatedModel } from '../../models/LastUpdated';

const documentCount = async (model) => {
    const updated = await LastUpdatedModel.findOne({});
    if (!updated) {
        return 0;
    }
    const date = updated.date;
    return { count: await model.find({date}).countDocuments() }
};

export {documentCount};
