package sexocom.example.demo.dto;

public record RegisterResponse(UserResponse user, boolean alreadyExisted) {}
