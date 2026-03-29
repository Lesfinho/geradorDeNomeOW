package sexocom.example.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import sexocom.example.demo.model.AppUser;

import java.util.Optional;

public interface AppUserRepository extends JpaRepository<AppUser, Long> {
    Optional<AppUser> findByUsername(String username);
    boolean existsByUsername(String username);
}
