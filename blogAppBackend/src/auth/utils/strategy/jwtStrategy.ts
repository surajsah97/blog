import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy){
    constructor(){
        super({
            jwtFromRequest:ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration:false,
            secretOrKey:"sxdcfvgbhj"
        })
    }

    async validate(payload: any) {
        console.log("jwt strategy vlidate");
        console.log({payload});

        return payload;
        // return { id: payload.sub, email: payload.email };
    }
}