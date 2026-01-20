import mongoose, { Schema, model, models } from "mongoose";

const ProspectSchema = new Schema(
    {
        name: { type: String, required: true },
        category: { type: String, required: true },
        rating: { type: Number, default: 0 },
        reviewCount: { type: Number, default: 0 },
        address: { type: String, required: true },
        priority: {
            type: String,
            enum: ["URGENTE", "ALTA", "MEDIA", "BAJA"],
            default: "MEDIA",
        },
        gaps: { type: [String], default: [] },
        pitch: { type: String, default: "" },
        hasWebsite: { type: Boolean, default: false },
        hasApi: { type: Boolean, default: false },
        analysisStatus: {
            type: String,
            enum: ["Deficiente", "Completo", "Parcial"],
            default: "Deficiente",
        },
        phone: { type: String, required: true },
        email: { type: String }, // New field
        whatsapp: { type: String },
        coordinates: {
            lat: Number,
            lng: Number,
        },
    },
    { timestamps: true }
);

const Prospect = models.Prospect || model("Prospect", ProspectSchema);

export default Prospect;
