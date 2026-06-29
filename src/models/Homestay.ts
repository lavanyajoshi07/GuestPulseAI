import mongoose, { Schema, Document } from 'mongoose';

export interface IHomestay extends Document {
  ownerId: mongoose.Types.ObjectId;
  homestayName: string;
  location: string;
  propertyType: string;
  description?: string;
  logo?: string;
  createdAt: Date;
  updatedAt: Date;
}

const HomestaySchema = new Schema<IHomestay>(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner ID is required'],
      unique: true,
      index: true,
    },
    homestayName: {
      type: String,
      required: [true, 'Homestay Name is required'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    propertyType: {
      type: String,
      required: [true, 'Property Type is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    logo: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Homestay =
  mongoose.models.Homestay || mongoose.model<IHomestay>('Homestay', HomestaySchema);

export default Homestay;
