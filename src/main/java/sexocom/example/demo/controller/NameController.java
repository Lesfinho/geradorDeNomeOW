package sexocom.example.demo.controller;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import sexocom.example.demo.dto.*;
import sexocom.example.demo.service.NameService;

@RestController
@RequestMapping("/api/names")
public class NameController {

    private final NameService nameService;

    public NameController(NameService nameService) {
        this.nameService = nameService;
    }

    @PostMapping
    public NameResponse addName(@Valid @RequestBody AddNameRequest request) {
        return nameService.addName(request.name(), request.userId());
    }

    @PostMapping("/draw")
    public DrawResponse draw(@Valid @RequestBody DrawRequest request) {
        return nameService.drawRandomName(request.userId());
    }

    @GetMapping("/stats")
    public PoolStatsResponse stats() {
        return nameService.getStats();
    }
}
