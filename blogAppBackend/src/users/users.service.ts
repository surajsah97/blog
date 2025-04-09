import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { AuthDto } from "src/dto/auth.dto";
import { CreateUserDto } from "src/dto/createUser.dto";
import { User } from "src/schemas/User.schema";

@Injectable()
export class UsersService {
constructor(@InjectModel(User.name) private userModel: Model<User>){}
    createUser(createUserData: AuthDto){
        const user = new this.userModel(createUserData);
        return user.save();
    }

    async getUsers(){
        return await this.userModel.find();
    }

    async getUserById(id: string){
        console.log({id})
        let user= await this.userModel.findById(id).exec();
        if(user){
            return user;
        }
        return null;
    }
}


