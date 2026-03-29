package sexocom.example.demo.service;

import org.springframework.stereotype.Service;
import sexocom.example.demo.dto.RegisterResponse;
import sexocom.example.demo.dto.UserResponse;
import sexocom.example.demo.model.AppUser;
import sexocom.example.demo.repository.AppUserRepository;

@Service
public class UserService {

    private final AppUserRepository userRepository;

    public UserService(AppUserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public RegisterResponse register(String username) {
        var existing = userRepository.findByUsername(username);
        if (existing.isPresent()) {
            var user = existing.get();
            return new RegisterResponse(new UserResponse(user.getId(), user.getUsername()), true);
        }
        var user = userRepository.save(new AppUser(username));
        return new RegisterResponse(new UserResponse(user.getId(), user.getUsername()), false);
    }

    public AppUser getById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + id));
    }
}
