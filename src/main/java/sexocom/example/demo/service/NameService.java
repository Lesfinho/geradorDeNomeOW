package sexocom.example.demo.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import sexocom.example.demo.dto.DrawResponse;
import sexocom.example.demo.dto.NameResponse;
import sexocom.example.demo.dto.PoolStatsResponse;
import sexocom.example.demo.model.AppUser;
import sexocom.example.demo.model.NameEntry;
import sexocom.example.demo.repository.NameEntryRepository;

@Service
public class NameService {

    private final NameEntryRepository nameRepository;
    private final UserService userService;

    public NameService(NameEntryRepository nameRepository, UserService userService) {
        this.nameRepository = nameRepository;
        this.userService = userService;
    }

    public NameResponse addName(String name, Long userId) {
        AppUser user = userService.getById(userId);
        NameEntry entry = nameRepository.save(new NameEntry(name, user));
        return toResponse(entry);
    }

    @Transactional
    public DrawResponse drawRandomName(Long userId) {
        AppUser user = userService.getById(userId);
        var optional = nameRepository.findRandomAvailable();
        if (optional.isEmpty()) {
            return new DrawResponse(null, true);
        }
        NameEntry entry = optional.get();
        entry.setUsed(true);
        entry.setDrawnBy(user);
        nameRepository.save(entry);
        return new DrawResponse(toResponse(entry), false);
    }

    public PoolStatsResponse getStats() {
        long available = nameRepository.countByIsUsedFalse();
        long total = nameRepository.count();
        return new PoolStatsResponse(available, total);
    }

    private NameResponse toResponse(NameEntry entry) {
        return new NameResponse(
                entry.getId(),
                entry.getName(),
                entry.isUsed(),
                entry.getAddedBy().getUsername(),
                entry.getDrawnBy() != null ? entry.getDrawnBy().getUsername() : null
        );
    }
}
