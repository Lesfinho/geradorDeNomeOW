package sexocom.example.demo.dto;

import jakarta.validation.constraints.NotNull;

public record DrawRequest(@NotNull Long userId) {}
