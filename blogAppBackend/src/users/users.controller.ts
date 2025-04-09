import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, UseGuards } from "@nestjs/common";
import { UsersService } from "./users.service";
import { CreateUserDto } from "src/dto/createUser.dto";
import mongoose from "mongoose";
import { JwtAuthGuard } from "src/auth/utils/guards/jwt.guard";
import { AuthDto } from "src/dto/auth.dto";


@Controller('users')
export class UsersController {

    constructor(private usersService: UsersService) {}
@Post()
async createUser(@Body() user:AuthDto) {
    return await this.usersService.createUser(user)

}   

@Get()
@UseGuards(JwtAuthGuard)
async getUsers() {
    return await this.usersService.getUsers()
}

@Get(':id')
@UseGuards(JwtAuthGuard)
async getUserById(@Param('id') id: string) {
    try{
        if(!mongoose.Types.ObjectId.isValid(id)){
            throw new HttpException('Invalid ID',400);
        }
    const findUser= await this.usersService.getUserById(id);
    if(!findUser){
        throw new HttpException('User not found',404);
    }
    return findUser;
}
catch(error){
    throw new HttpException('Something Went Wrong',500);
}
}


}