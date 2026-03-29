package sexocom.example.demo.controller;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import sexocom.example.demo.dto.RegisterRequest;
import sexocom.example.demo.dto.RegisterResponse;
import sexocom.example.demo.service.UserService;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public RegisterResponse register(@Valid @RequestBody RegisterRequest request) {
        return userService.register(request.username());
    }
}
