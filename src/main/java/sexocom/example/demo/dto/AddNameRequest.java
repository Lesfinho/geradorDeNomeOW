package sexocom.example.demo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record AddNameRequest(
    @NotBlank @Size(min = 1, max = 255) String name,
    @NotNull Long userId
) {}
