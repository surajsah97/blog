import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { AuthProvider } from "src/dto/auth.dto";
import { Document } from "mongoose";

// Make sure User extends Document to get the full Mongoose document functionality
@Schema({ timestamps: true })  // Automatically adds `createdAt` and `updatedAt`
export class User extends Document {
   
    @Prop({ required: true })
    email: string;

    @Prop()
    pic: string;

    @Prop()
    password: string;

    @Prop({ required: true, enum: AuthProvider })
    provider: AuthProvider;

    @Prop()
    facebookId?: string;  // Make this optional for OAuth users

    @Prop()
    googleId?: string;    // Make this optional for OAuth users

    @Prop()
    firstName?: string;

    @Prop()
    lastName?: string;

    @Prop({ default: Date.now })  // Set default to current date
    createdAt: Date;

    @Prop({ default: Date.now })  // Set default to current date
    updatedAt: Date;

    @Prop({ required: true })
    userName: string;
}

// Create and export the schema
export const UserSchema = SchemaFactory.createForClass(User);
