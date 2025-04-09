import { Inject, Injectable } from "@nestjs/common";
import { PassportSerializer } from "@nestjs/passport";
import { UsersService } from "src/users/users.service";


@Injectable()
export class SessionSerializeUser extends PassportSerializer {
    constructor(private readonly userService:UsersService){
        super()
    }
    serializeUser(user: any, done: Function) {
        console.log({user},"serialize user")

        return done(null,user)
    }
   async deserializeUser(payload: any, done: Function) {
    console.log({payload,func:this.userService},typeof payload._id,payload._id,"deserialize user")
        const user=await this.userService.getUserById(payload._id);
        console.log({user},"deserialize user")
        return user ? done(null,user) :done(null,null)
    }
}
    