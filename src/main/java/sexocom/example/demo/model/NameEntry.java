package sexocom.example.demo.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "name_entry")
public class NameEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(nullable = false)
    private boolean isUsed = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "added_by_id", nullable = false)
    private AppUser addedBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "drawn_by_id")
    private AppUser drawnBy;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public NameEntry() {}

    public NameEntry(String name, AppUser addedBy) {
        this.name = name;
        this.addedBy = addedBy;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public boolean isUsed() { return isUsed; }
    public void setUsed(boolean used) { isUsed = used; }
    public AppUser getAddedBy() { return addedBy; }
    public void setAddedBy(AppUser addedBy) { this.addedBy = addedBy; }
    public AppUser getDrawnBy() { return drawnBy; }
    public void setDrawnBy(AppUser drawnBy) { this.drawnBy = drawnBy; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
