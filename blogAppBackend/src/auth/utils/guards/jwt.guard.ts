import { ExecutionContext, Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Observable } from "rxjs";

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt'){
    canActivate(context:ExecutionContext):boolean| Promise<boolean> | Observable<boolean> {
        console.log("Inside can Activated jwt auth guard")
        return super.canActivate(context)
    }
}