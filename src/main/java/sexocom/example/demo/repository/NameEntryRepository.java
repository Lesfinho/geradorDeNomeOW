package sexocom.example.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import sexocom.example.demo.model.NameEntry;

import java.util.Optional;

public interface NameEntryRepository extends JpaRepository<NameEntry, Long> {

    @Query(value = "SELECT * FROM name_entry WHERE is_used = false ORDER BY RANDOM() LIMIT 1 FOR UPDATE SKIP LOCKED", nativeQuery = true)
    Optional<NameEntry> findRandomAvailable();

    long countByIsUsedFalse();
}
