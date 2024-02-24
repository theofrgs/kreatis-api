import { Controller, Get, HttpStatus } from "@nestjs/common";
import { Public } from "./services/decorators/public.decorator";

@Controller('health')
export class HealthController {

    @Public()
    @Get()
    checkHealth() {
        return HttpStatus.OK;
    }
}