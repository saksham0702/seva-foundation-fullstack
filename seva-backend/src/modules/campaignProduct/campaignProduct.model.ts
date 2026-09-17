import {Document,Types} from "mongoose";
import {Schema, model} from "mongoose";

export interface ICampaignProduct extends Document {
    name: string;
    image: string;
    price: number;
    unit: number;
    unitType: string;
    isDeleted: boolean;
    createdBy: Types.ObjectId;
    updatedBy: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const CampaignProductSchema = new Schema<ICampaignProduct>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        image: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        unit: {
            type: Number,
            required: true,
        },
        unitType: {
            type: String,
            required: true,
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        updatedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
    },
    {
        timestamps: true,
    }
)
export const CampaignProduct = model<ICampaignProduct>("CampaignProduct", CampaignProductSchema);
